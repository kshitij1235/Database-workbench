"use client"

import { useState, useCallback, useEffect } from "react"
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow"
import "reactflow/dist/style.css"
import { TableNode } from "@/components/table-node"
import { Button } from "@/components/ui/button"
import { parseDbml } from "@/lib/dbmlParser"
import { exportToDbml } from "@/lib/dbmlExporter"
import { exportToSql } from "@/lib/sqlExporter"
import { toast } from "sonner"

const nodeTypes = {
  table: TableNode,
}

export default function Workbench() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNodes, setSelectedNodes] = useState([])

  // Add these functions inside the Workbench component

  const onUpdateTableName = useCallback((id, newName) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: newName } } : node)),
    )
  }, [])

  const onTogglePrimaryKey = useCallback((id, columnName) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === id) {
          const updatedColumns = node.data.columns.map((col) => ({
            ...col,
            isPrimaryKey: col.name === columnName ? !col.isPrimaryKey : false,
          }))
          return { ...node, data: { ...node.data, columns: updatedColumns } }
        }
        return node
      }),
    )
  }, [])

  // Update the addTable function to include these new callbacks
  const addTable = useCallback(() => {
    const newNode = {
      id: `table-${Date.now()}`,
      type: "table",
      position: { x: 100, y: 100 },
      data: {
        label: "New Table",
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
      },
    }
    setNodes((nds) => [...nds, newNode])

    toast("Success!", {
      description: "New table created!",
      duration: 1000,
      style: { backgroundColor: "green", color: "white" },
    })
  }, [onUpdateTableName, onTogglePrimaryKey])

  // Update the useEffect that loads DBML data to include the new callbacks
  useEffect(() => {
    const dbml = localStorage.getItem("dbml")
    if (dbml) {
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
        },
      }))

      setNodes(parsedNodes)
      localStorage.removeItem("dbml")
    }
  }, [onUpdateTableName, onTogglePrimaryKey])

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [])
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [])

  // Track selected nodes
  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodes(nodes.map((node) => node.id))
  }, [])

  // Delete selected nodes when pressing Delete key
  const handleKeyDown = useCallback(
    (event) => {
      if ((event.ctrlKey && event.key === "e") || (event.ctrlKey && event.key === "E")) {
        event.preventDefault()
        addTable()
      } else if (event.key === "Delete" && selectedNodes.length > 0) {
        setNodes((nds) => {
          const deletedNodes = nds.filter((node) => selectedNodes.includes(node.id))
          const deletedTitles = deletedNodes.map((node) => node.data.label).join(", ")
          toast("Success!", {
            description: `Deleted table(s): ${deletedTitles}`,
            duration: 1000,
            style: { backgroundColor: "red", color: "white" },
          })
          return nds.filter((node) => !selectedNodes.includes(node.id))
        })
        setSelectedNodes([])
      }
    },
    [addTable, selectedNodes],
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

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Database Workbench</h1>
        <div className="space-x-2">
          <Button onClick={handleExportDbml}>Export DBML</Button>
          <Button onClick={handleExportSql}>Export SQL</Button>
        </div>
      </div>
      <div className="flex-grow">
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
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

