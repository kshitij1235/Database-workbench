"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  type Edge,
  type Connection,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { TableNode } from "@/components/workbench/tableNode"
import { Button } from "@/components/ui/button"
import { parseDbml } from "@/lib/dbmlParser"
import { exportToDbml } from "@/lib/dbmlExporter"
import { exportToSql } from "@/lib/sqlExporter"
import { useTheme } from "next-themes"
import { Layout, ZoomIn, Trash2 } from "lucide-react"
import { InfoBox } from "@/components/workbench/workbenchInfoBox"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { SchemaPanel } from "@/components/workbench/schemaPannel"
import { SchemaToggle } from "@/components/workbench/schemaToggle"
import { WorkbenchHeader } from "./workbenchHeader"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExportDialog } from "@/components/workbench/ExportDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const nodeTypes = {
  table: TableNode,
}

const validColumnTypes = [
  "INT",
  "BIGINT",
  "FLOAT",
  "DOUBLE",
  "DECIMAL",
  "VARCHAR",
  "CHAR",
  "TEXT",
  "DATE",
  "DATETIME",
  "TIMESTAMP",
  "BOOLEAN",
  "ENUM",
]

// Force-directed layout algorithm
const applyForceDirectedLayout = (nodes, edges, width, height) => {
  // Constants for the force-directed algorithm
  const REPULSION = 10000 // Repulsion force between nodes
  const ATTRACTION = 0.3 // Attraction force for connected nodes
  const EDGE_LENGTH = 300 // Ideal edge length
  const ITERATIONS = 50 // Number of iterations to run
  const NODE_WIDTH = 250 // Approximate node width
  const NODE_HEIGHT = 300 // Approximate node height
  const PADDING = 50 // Padding from edges

  // Clone nodes to avoid mutating the original
  const layoutNodes = nodes.map((node) => ({
    ...node,
    position: { ...node.position },
    velocity: { x: 0, y: 0 },
    mass: 1 + node.data.columns.length * 0.1, // Nodes with more columns are heavier
  }))

  // Create a map of connections for quick lookup
  const connections = {}
  edges.forEach((edge) => {
    if (!connections[edge.source]) connections[edge.source] = []
    if (!connections[edge.target]) connections[edge.target] = []

    connections[edge.source].push(edge.target)
    connections[edge.target].push(edge.source)
  })

  // Run the simulation for a fixed number of iterations
  for (let i = 0; i < ITERATIONS; i++) {
    // Calculate forces for each node
    for (let a = 0; a < layoutNodes.length; a++) {
      const nodeA = layoutNodes[a]

      // Initialize forces
      let forceX = 0
      let forceY = 0

      // Repulsion forces (from all other nodes)
      for (let b = 0; b < layoutNodes.length; b++) {
        if (a === b) continue

        const nodeB = layoutNodes[b]
        const dx = nodeA.position.x - nodeB.position.x
        const dy = nodeA.position.y - nodeB.position.y

        // Avoid division by zero
        const distanceSquared = Math.max(1, dx * dx + dy * dy)
        const distance = Math.sqrt(distanceSquared)

        // Stronger repulsion for closer nodes
        const repulsionForce = REPULSION / distanceSquared

        // Add to total force
        forceX += (dx / distance) * repulsionForce
        forceY += (dy / distance) * repulsionForce
      }

      // Attraction forces (only for connected nodes)
      if (connections[nodeA.id]) {
        for (const connectedId of connections[nodeA.id]) {
          const connectedNode = layoutNodes.find((n) => n.id === connectedId)
          if (connectedNode) {
            const dx = nodeA.position.x - connectedNode.position.x
            const dy = nodeA.position.y - connectedNode.position.y

            const distance = Math.sqrt(dx * dx + dy * dy)
            const displacement = distance - EDGE_LENGTH

            // Only apply attraction if nodes are further than ideal distance
            if (distance > EDGE_LENGTH) {
              forceX -= (dx / distance) * displacement * ATTRACTION
              forceY -= (dy / distance) * displacement * ATTRACTION
            }
          }
        }
      }

      // Update velocity (with damping)
      nodeA.velocity.x = (nodeA.velocity.x + forceX) * 0.8
      nodeA.velocity.y = (nodeA.velocity.y + forceY) * 0.8
    }

    // Update positions
    for (const node of layoutNodes) {
      node.position.x += node.velocity.x
      node.position.y += node.velocity.y

      // Keep nodes within bounds
      node.position.x = Math.max(PADDING, Math.min(width - NODE_WIDTH - PADDING, node.position.x))
      node.position.y = Math.max(PADDING, Math.min(height - NODE_HEIGHT - PADDING, node.position.y))
    }
  }

  // Return nodes with updated positions
  return layoutNodes.map((node) => ({
    ...node,
    position: node.position,
  }))
}

// Grid layout algorithm
const applyGridLayout = (nodes, width, height) => {
  const NODE_WIDTH = 280
  const NODE_HEIGHT = 350
  const PADDING = 80

  const columns = Math.max(1, Math.floor((width - PADDING) / (NODE_WIDTH + PADDING)))

  return nodes.map((node, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)

    return {
      ...node,
      position: {
        x: PADDING + column * (NODE_WIDTH + PADDING),
        y: PADDING + row * (NODE_HEIGHT + PADDING),
      },
    }
  })
}

// Hierarchical layout algorithm
const applyHierarchicalLayout = (nodes, edges, width, height) => {
  // Find root nodes (nodes that have outgoing edges but no incoming edges)
  const incomingEdges = {}
  const outgoingEdges = {}

  edges.forEach((edge) => {
    if (!incomingEdges[edge.target]) incomingEdges[edge.target] = []
    if (!outgoingEdges[edge.source]) outgoingEdges[edge.source] = []

    incomingEdges[edge.target].push(edge.source)
    outgoingEdges[edge.source].push(edge.target)
  })

  // Find root nodes (no incoming edges)
  let rootNodes = nodes.filter((node) => !incomingEdges[node.id] || incomingEdges[node.id].length === 0)

  // If no root nodes, just use the first node
  if (rootNodes.length === 0 && nodes.length > 0) {
    rootNodes = [nodes[0]]
  }

  // Assign levels to nodes
  const levels = {}
  const visited = new Set()

  const assignLevel = (nodeId, level) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    levels[nodeId] = Math.max(level, levels[nodeId] || 0)

    if (outgoingEdges[nodeId]) {
      outgoingEdges[nodeId].forEach((targetId) => {
        assignLevel(targetId, level + 1)
      })
    }
  }

  rootNodes.forEach((node) => assignLevel(node.id, 0))

  // Handle nodes not visited (disconnected)
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      levels[node.id] = 0
    }
  })

  // Count nodes per level
  const nodesPerLevel = {}
  Object.entries(levels).forEach(([nodeId, level]) => {
    if (!nodesPerLevel[level]) nodesPerLevel[level] = []
    nodesPerLevel[level].push(nodeId)
  })

  // Position nodes
  const NODE_WIDTH = 280
  const NODE_HEIGHT = 350
  const LEVEL_HEIGHT = NODE_HEIGHT + 100
  const HORIZONTAL_PADDING = 80

  const result = nodes.map((node) => {
    const level = levels[node.id]
    const levelNodes = nodesPerLevel[level]
    const index = levelNodes.indexOf(node.id)

    const levelWidth = width - HORIZONTAL_PADDING * 2
    const nodeSpacing = Math.max(NODE_WIDTH + 20, levelWidth / (levelNodes.length || 1))

    return {
      ...node,
      position: {
        x: HORIZONTAL_PADDING + index * nodeSpacing,
        y: 100 + level * LEVEL_HEIGHT,
      },
    }
  })

  return result
}

export default function Workbench() {
  const { theme, setTheme } = useTheme()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodes, setSelectedNodes] = useState([])
  const { toast } = useToast()
  const [isSchemaOpen, setIsSchemaOpen] = useState(false)
  const reactFlowInstanceRef = useRef(null)
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportSqlContent, setExportSqlContent] = useState("")
  const [exportDbmlContent, setExportDbmlContent] = useState("")
  const [deleteNodeId, setDeleteNodeId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState(null)
  const [longPressPosition, setLongPressPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Move these functions inside the component so they have access to setNodes
  const onToggleNotNull = useCallback(
    (id, columnName) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = node.data.columns.map((col) => {
              // Don't automatically set NOT NULL for primary keys
              if (col.name === columnName) {
                return {
                  ...col,
                  isNotNull: !col.isNotNull,
                }
              }
              return col
            })
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const onToggleUnique = useCallback(
    (id, columnName) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = node.data.columns.map((col) => {
              // Don't automatically set UNIQUE for primary keys
              if (col.name === columnName) {
                return {
                  ...col,
                  isUnique: !col.isUnique,
                }
              }
              return col
            })
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const onToggleAutoIncrement = useCallback(
    (id, columnName) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = node.data.columns.map((col) => ({
              ...col,
              isAutoIncrement: col.name === columnName ? !col.isAutoIncrement : col.isAutoIncrement,
            }))
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const onUpdateTableName = useCallback(
    (id, newName) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: newName } } : node)),
      )
    },
    [setNodes],
  )

  const onTogglePrimaryKey = useCallback(
    (id, columnName) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = node.data.columns.map((col) => {
              if (col.name === columnName) {
                // Toggle primary key without affecting NOT NULL and UNIQUE
                return {
                  ...col,
                  isPrimaryKey: !col.isPrimaryKey,
                }
              }
              return col
            })
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const onToggleIndex = useCallback(
    (id, columnName) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = node.data.columns.map((col) => ({
              ...col,
              isIndexed: col.name === columnName ? !col.isIndexed : col.isIndexed,
            }))
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const onDeleteColumn = useCallback(
    (id, index) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = [...node.data.columns]
            updatedColumns.splice(index, 1)
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
      toast({
        title: "Column Deleted",
        description: "The column has been removed from the table.",
      })
    },
    [setNodes, toast],
  )

  // Check if column name already exists in the table
  const isColumnNameDuplicate = useCallback(
    (tableId, columnName, excludeIndex = -1) => {
      const table = nodes.find((node) => node.id === tableId)
      if (!table) return false

      return table.data.columns.some(
        (col, index) => index !== excludeIndex && col.name.toLowerCase() === columnName.toLowerCase(),
      )
    },
    [nodes],
  )

  // Update the onAddColumn function to check for duplicate column names
  const onAddColumn = useCallback(
    (
      id,
      name,
      type,
      isIndexed = false,
      isPrimaryKey = false,
      isNotNull = false,
      isUnique = false,
      isAutoIncrement = false,
      defaultValue = null,
      checkConstraint = null,
    ) => {
      // Check for duplicate column name
      if (isColumnNameDuplicate(id, name)) {
        toast({
          title: "Duplicate Column Name",
          description: `A column named "${name}" already exists in this table.`,
          variant: "destructive",
        })
        return false
      }

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  columns: [
                    ...node.data.columns,
                    {
                      name,
                      type,
                      isPrimaryKey,
                      isIndexed,
                      isNotNull,
                      isUnique,
                      isAutoIncrement,
                      defaultValue,
                      checkConstraint,
                    },
                  ],
                },
              }
            : node,
        ),
      )
      return true
    },
    [setNodes, isColumnNameDuplicate, toast],
  )

  // Update the onUpdateColumn function to handle all column properties and check for duplicates
  const onUpdateColumn = useCallback(
    (
      id,
      index,
      newName,
      newType,
      isPrimaryKey = false,
      isNotNull = false,
      isUnique = false,
      isAutoIncrement = false,
      defaultValue = null,
      checkConstraint = null,
    ) => {
      // Check for duplicate column name
      if (isColumnNameDuplicate(id, newName, index)) {
        toast({
          title: "Duplicate Column Name",
          description: `A column named "${newName}" already exists in this table.`,
          variant: "destructive",
        })
        return false
      }

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = [...node.data.columns]
            updatedColumns[index] = {
              ...updatedColumns[index],
              name: newName,
              type: newType,
              isPrimaryKey,
              isNotNull,
              isUnique,
              isAutoIncrement,
              defaultValue,
              checkConstraint,
            }
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
      return true
    },
    [setNodes, isColumnNameDuplicate, toast],
  )

  const getNewNodePosition = useCallback(
    (x = null, y = null) => {
      if (x !== null && y !== null) {
        return { x, y }
      }

      const padding = 20
      const nodeWidth = 250
      const nodeHeight = 300
      const existingPositions = nodes.map((node) => node.position)
      const newPos = { x: padding, y: padding }

      while (
        existingPositions.some(
          (pos) => Math.abs(pos.x - newPos.x) < nodeWidth && Math.abs(pos.y - newPos.y) < nodeHeight,
        )
      ) {
        if (newPos.x + nodeWidth + padding < window.innerWidth) {
          newPos.x += nodeWidth + padding
        } else {
          newPos.x = padding
          newPos.y += nodeHeight + padding
        }
      }

      return newPos
    },
    [nodes],
  )

  // Update the addTable function to include these functions
  const addTable = useCallback(
    (x = null, y = null) => {
      const newNode = {
        id: `table-${Date.now()}`,
        type: "table",
        position: getNewNodePosition(x, y),
        data: {
          label: "NewTable",
          columns: [],
          onAddColumn,
          onUpdateTableName,
          onTogglePrimaryKey,
          onUpdateColumn,
          onDeleteColumn,
          onToggleIndex,
          onToggleNotNull,
          onToggleUnique,
          onToggleAutoIncrement,
          validColumnTypes,
          isColumnNameDuplicate,
          onLongPress: (nodeId) => {
            setDeleteNodeId(nodeId)
            setIsDeleteDialogOpen(true)
          },
        },
      }
      setNodes((nds) => [...nds, newNode])
      toast({
        title: "Table Created",
        description: "A new table has been added to your database schema.",
      })
    },
    [
      onAddColumn,
      onUpdateTableName,
      onTogglePrimaryKey,
      onToggleIndex,
      onUpdateColumn,
      onDeleteColumn,
      onToggleNotNull,
      onToggleUnique,
      onToggleAutoIncrement,
      getNewNodePosition,
      setNodes,
      toast,
      isColumnNameDuplicate,
    ],
  )

  useEffect(() => {
    const dbmlData = localStorage.getItem("dbmlData")
    if (dbmlData) {
      const { dbml, relationships } = JSON.parse(dbmlData)
      let parsedNodes = parseDbml(dbml)

      parsedNodes = parsedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddColumn,
          onUpdateTableName,
          onTogglePrimaryKey,
          onUpdateColumn,
          onDeleteColumn,
          onToggleIndex,
          onToggleNotNull,
          onToggleUnique,
          onToggleAutoIncrement,
          validColumnTypes,
          isColumnNameDuplicate,
          onLongPress: (nodeId) => {
            setDeleteNodeId(nodeId)
            setIsDeleteDialogOpen(true)
          },
        },
      }))

      setNodes(parsedNodes)

      // Create edges based on relationships
      const newEdges = relationships
        .map((rel, index) => {
          const sourceNode = parsedNodes.find((node) => node.data.label === rel.sourceTable)
          const targetNode = parsedNodes.find((node) => node.data.label === rel.targetTable)

          if (sourceNode && targetNode) {
            const sourceId = sourceNode.id
            const targetId = targetNode.id
            const sourceColumn = rel.sourceColumn
            const targetColumn = rel.targetColumn

            return {
              id: `edge-${index}`,
              source: sourceId,
              target: targetId,
              sourceHandle: `${sourceId}-${sourceColumn}-source`,
              targetHandle: `${targetId}-${targetColumn}-target`,
              animated: true,
              style: { strokeWidth: 2 },
              label: `${rel.sourceTable}.${sourceColumn} → ${rel.targetTable}.${targetColumn}`,
              labelBgStyle: { backgroundColor: "transparent" },
              data: {
                sourceTable: rel.sourceTable,
                sourceColumn: sourceColumn,
                targetTable: rel.targetTable,
                targetColumn: targetColumn,
                options: rel.options || "",
              },
            }
          }
          return null
        })
        .filter(Boolean)

      setEdges(newEdges)

      localStorage.removeItem("dbmlData")

      // Apply automatic layout after loading
      setTimeout(() => {
        if (reactFlowWrapper.current && reactFlowInstance) {
          const { width, height } = reactFlowWrapper.current.getBoundingClientRect()
          const layoutedNodes = applyHierarchicalLayout(parsedNodes, newEdges, width, height)
          setNodes(layoutedNodes)

          // Fit view after layout
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2 })
          }, 50)
        }
      }, 100)
    }
  }, [
    onAddColumn,
    onUpdateTableName,
    onTogglePrimaryKey,
    onToggleIndex,
    onUpdateColumn,
    onDeleteColumn,
    onToggleNotNull,
    onToggleUnique,
    onToggleAutoIncrement,
    setNodes,
    setEdges,
    reactFlowInstance,
    isColumnNameDuplicate,
  ])

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Extract source and target node information
      const sourceNode = nodes.find((node) => node.id === params.source)
      const targetNode = nodes.find((node) => node.id === params.target)

      if (!sourceNode || !targetNode) return

      // Extract column names from the handle IDs
      // Handle IDs are in format: "nodeId-columnName-source/target"
      // We need to extract the middle part (columnName)
      const sourceHandleId = params.sourceHandle || ""
      const targetHandleId = params.targetHandle || ""

      // Extract the column name by removing the nodeId and -source/-target parts
      const sourceColumn = sourceHandleId.replace(`${params.source}-`, "").replace("-source", "")

      const targetColumn = targetHandleId.replace(`${params.target}-`, "").replace("-target", "")

      // Create a custom edge with styling
      const customEdge = {
        ...params,
        animated: true,
        style: { strokeWidth: 2 },
        label: `${sourceNode.data.label}.${sourceColumn} → ${targetNode.data.label}.${targetColumn}`,
        labelBgStyle: { backgroundColor: "transparent" },
        data: {
          sourceTable: sourceNode.data.label,
          sourceColumn: sourceColumn,
          targetTable: targetNode.data.label,
          targetColumn: targetColumn,
        },
      }

      setEdges((eds) => addEdge(customEdge, eds))
    },
    [nodes, setEdges],
  )

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes.map((node) => node.id))
  }, [])

  // Keyboard Event Handler (Ctrl + E for addTable)
  const handleKeyDown = useCallback((event) => {
    if ((event.ctrlKey && event.key === "e") || (event.ctrlKey && event.key === "E")) {
      event.preventDefault();
      addTable(); // Replace with your logic to add a table
    } else if (event.key === "Delete") {
      if (selectedNodes.length > 0) {
        setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
        setSelectedNodes([]);
      } else {
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }
    }
  }, [addTable, selectedNodes, setNodes, setEdges]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown]);

  // Touch Event Handler (Long press to trigger addTable)
  useEffect(() => {
    if (typeof window !== "undefined") {
      let touchStartTime = 0;
      let touchTimeout = null;

      const handleTouchStart = () => {
        touchStartTime = Date.now();
        touchTimeout = setTimeout(() => {
          addTable(); // Replace with your long press action
        }, 500); // Adjust this value for longer or shorter press duration
      };

      const handleTouchEnd = () => {
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration < 500 && touchTimeout) {
          clearTimeout(touchTimeout);
        }
      };

      document.addEventListener("touchstart", handleTouchStart, { passive: true });
      document.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [addTable]);

  const handleExport = () => {
    const dbml = exportToDbml(nodes, edges)
    const sql = exportToSql(nodes, edges)
    setExportDbmlContent(dbml)
    setExportSqlContent(sql)
    setIsExportDialogOpen(true)
  }

  const handleDownloadExport = (type: "sql" | "dbml") => {
    const content = type === "sql" ? exportSqlContent : exportDbmlContent
    const fileName = type === "sql" ? "database.sql" : "database.dbml"
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()

    toast({
      title: `${type.toUpperCase()} Exported`,
      description: `Your database schema has been exported as ${fileName}.`,
    })
  }

  const toggleSchema = useCallback(() => {
    setIsSchemaOpen((prev) => !prev)
  }, [])

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (reactFlowInstance) {
        const node = nodes.find((n) => n.id === nodeId)
        if (node) {
          // Center view on the node
          reactFlowInstance.setCenter(node.position.x + 125, node.position.y + 100, { duration: 800 })

          // Select the node
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              selected: n.id === nodeId,
            })),
          )
        }
      }
    },
    [nodes, setNodes, reactFlowInstance],
  )

  // Layout functions
  const applyLayout = (layoutType) => {
    if (reactFlowWrapper.current && reactFlowInstance) {
      const { width, height } = reactFlowWrapper.current.getBoundingClientRect()

      let layoutedNodes
      switch (layoutType) {
        case "force":
          layoutedNodes = applyForceDirectedLayout(nodes, edges, width, height)
          break
        case "grid":
          layoutedNodes = applyGridLayout(nodes, width, height)
          break
        case "hierarchical":
          layoutedNodes = applyHierarchicalLayout(nodes, edges, width, height)
          break
        default:
          layoutedNodes = nodes
      }

      setNodes(layoutedNodes)

      // Fit view after layout
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 })
      }, 50)

      toast({
        title: "Layout Applied",
        description: `Applied ${layoutType} layout to your schema.`,
      })
    }
  }

  const fitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 })
    }
  }

  // Handle long press for mobile
  const handlePaneMouseDown = (event) => {
    if (!isMobile) return

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    setLongPressPosition(position)

    const timer = setTimeout(() => {
      addTable(position.x, position.y)
    }, 800) // 800ms long press

    setLongPressTimer(timer)
  }

  const handlePaneMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleDeleteNode = () => {
    if (deleteNodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== deleteNodeId))
      setIsDeleteDialogOpen(false)
      setDeleteNodeId(null)

      toast({
        title: "Table Deleted",
        description: "The table has been removed from your database schema.",
      })
    }
  }

  const proOptions = { hideAttribution: true }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col dark:bg-gray-900 overflow-hidden">
        <WorkbenchHeader onExport={handleExport} />
        <div className="flex-grow relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              nodesDraggable={true}
              elementsSelectable={true}
              onSelectionChange={onSelectionChange}
              deleteKeyCode={null}
              multiSelectionKeyCode={null}
              selectionKeyCode={null}
              proOptions={proOptions}
              onInit={setReactFlowInstance}
              onMouseDown={handlePaneMouseDown}
              onMouseUp={handlePaneMouseUp}
              onTouchStart={handlePaneMouseDown}
              onTouchEnd={handlePaneMouseUp}
            >
              <Background color="#f0f0f0" gap={16} />
              <Controls />

              <Panel position="top-right" className="bg-background border rounded-md shadow-sm p-2 flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyLayout("hierarchical")}
                      className="h-8 w-8 p-0"
                    >
                      <Layout className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Hierarchical Layout</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => applyLayout("grid")} className="h-8 w-8 p-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Grid Layout</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={fitView} className="h-8 w-8 p-0">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Fit View</p>
                  </TooltipContent>
                </Tooltip>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
          {nodes.length === 0 && <InfoBox />}
        </div>
        <SchemaToggle isSchemaOpen={isSchemaOpen} onToggle={toggleSchema} />
        {isSchemaOpen && (
          <div className="absolute top-0 left-0 h-full z-10">
            <SchemaPanel onClose={toggleSchema} nodes={nodes} onNodeClick={handleNodeClick} />
          </div>
        )}
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          sqlContent={exportSqlContent}
          dbmlContent={exportDbmlContent}
          onExport={handleDownloadExport}
        />
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Table</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this table? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteNode} className="bg-red-500 hover:bg-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}

