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
} from "reactflow"
import "reactflow/dist/style.css"
import { TableNode } from "@/components/workbench/tableNode"
import { Button } from "@/components/ui/button"
import { parseDbml } from "@/lib/dbmlParser"
import { exportToDbml } from "@/lib/dbmlExporter"
import { exportToSql } from "@/lib/sqlExporter"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { InfoBox } from "@/components/workbench/workbenchInfoBox"
import { ExportDropdown } from "./exportOptionDropDown"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { SchemaPanel } from "@/components/workbench/schemaPannel"
import { SchemaToggle } from "@/components/workbench/schemaToggle"
import { styleText } from "util"

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

export default function Workbench() {
  const { theme, setTheme } = useTheme()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodes, setSelectedNodes] = useState([])
  const { toast } = useToast()
  const [isSchemaOpen, setIsSchemaOpen] = useState(false)
  const reactFlowInstanceRef = useRef(null)

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
            const updatedColumns = node.data.columns.map((col) => ({
              ...col,
              isPrimaryKey: col.name === columnName ? !col.isPrimaryKey : col.isPrimaryKey,
            }))
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

  const onUpdateColumn = useCallback(
    (id, index, newName, newType) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = [...node.data.columns]
            updatedColumns[index] = { ...updatedColumns[index], name: newName, type: newType }
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const getNewNodePosition = useCallback(() => {
    const padding = 20
    const nodeWidth = 250
    const nodeHeight = 300
    const existingPositions = nodes.map((node) => node.position)
    const newPos = { x: padding, y: padding }

    while (
      existingPositions.some((pos) => Math.abs(pos.x - newPos.x) < nodeWidth && Math.abs(pos.y - newPos.y) < nodeHeight)
    ) {
      if (newPos.x + nodeWidth + padding < window.innerWidth) {
        newPos.x += nodeWidth + padding
      } else {
        newPos.x = padding
        newPos.y += nodeHeight + padding
      }
    }

    return newPos
  }, [nodes])

  const addTable = useCallback(() => {
    const newNode = {
      id: `table-${Date.now()}`,
      type: "table",
      position: getNewNodePosition(),
      data: {
        label: "NewTable",
        columns: [],
        onAddColumn: (id, name, type) => {
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.id === id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      columns: [...node.data.columns, { name, type, isPrimaryKey: false }],
                    },
                  }
                : node,
            ),
          )
        },
        onUpdateTableName,
        onTogglePrimaryKey,
        onUpdateColumn,
        onDeleteColumn,
        onToggleIndex, 
        validColumnTypes,
      },
    }
    setNodes((nds) => [...nds, newNode])
    toast({
      title: "Table Created",
      description: "A new table has been added to your database schema.",
    })
  }, [onUpdateTableName, onTogglePrimaryKey,onToggleIndex, onUpdateColumn, onDeleteColumn, getNewNodePosition, setNodes, toast])

  useEffect(() => {
    const dbmlData = localStorage.getItem("dbmlData")
    if (dbmlData) {
      const { dbml, relationships } = JSON.parse(dbmlData)
      let parsedNodes = parseDbml(dbml)

      parsedNodes = parsedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddColumn: (id, name, type) => {
            setNodes((prevNodes) =>
              prevNodes.map((node) =>
                node.id === id
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        columns: [...node.data.columns, { name, type, isPrimaryKey: false }],
                      },
                    }
                  : node,
              ),
            )
          },
          onUpdateTableName,
          onTogglePrimaryKey,
          onUpdateColumn,
          onDeleteColumn,
          onToggleIndex, 
          validColumnTypes,
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
              style: { strokeWidth: 2},
              label: `${rel.sourceTable}.${sourceColumn} → ${rel.targetTable}.${targetColumn}`,
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
    }
  }, [onUpdateTableName, onTogglePrimaryKey,onToggleIndex ,onUpdateColumn, onDeleteColumn, setNodes, setEdges])

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

  const handleKeyDown = useCallback(
    (event) => {
      if ((event.ctrlKey && event.key === "e") || (event.ctrlKey && event.key === "E")) {
        event.preventDefault()
        addTable()
      } else if (event.key === "Delete") {
        if (selectedNodes.length > 0) {
          setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)))
          setSelectedNodes([])
        } else {
          setEdges((eds) => eds.filter((edge) => !edge.selected))
        }
      }
    },
    [addTable, selectedNodes, setNodes, setEdges],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  const handleExportDbml = () => {
    const dbml = exportToDbml(nodes, edges)
    const blob = new Blob([dbml], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "database.dbml"
    a.click()
  }

  const handleExportSql = () => {
    const sql = exportToSql(nodes, edges)
    const blob = new Blob([sql], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "database.sql"
    a.click()
  }

  const toggleSchema = useCallback(() => {
    setIsSchemaOpen((prev) => !prev)
  }, [])

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (reactFlowInstanceRef.current) {
        const node = nodes.find((n) => n.id === nodeId)
        if (node) {
          // Center view on the node
          reactFlowInstanceRef.current.setCenter(node.position.x + 125, node.position.y + 100, { duration: 800 })

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
    [nodes, setNodes],
  )

  const proOptions = { hideAttribution: true };
  return (
    <div className="h-screen flex flex-col dark:bg-gray-900 overflow-hidden">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
        <a className="text-2xl font-bold dark:text-white" href="/">
          Workbench
        </a>
        <div className="space-x-2 flex items-center">
          <ExportDropdown onExportDbml={handleExportDbml} onExportSql={handleExportSql} />

          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-grow relative">
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
            proOptions = { proOptions }
          >
            <Background color="#f0f0f0" gap={16} />
            <Controls />
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
      <Toaster />
    </div>
  )
}

