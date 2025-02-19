"use client"

import { useState, useCallback, useEffect } from "react"
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow"
import "reactflow/dist/style.css"
import { TableNode } from "@/components/table-node"
import { Button } from "@/components/ui/button"
import { parseDbml } from "@/lib/dbmlParser"
import { exportToDbml } from "@/lib/dbmlExporter"
import { exportToSql } from "@/lib/sqlExporter"

const nodeTypes = {
  table: TableNode,
}

export default function Workbench() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

useEffect(() => {
  const dbml = localStorage.getItem("dbml")
  if (dbml) {
    let parsedNodes = parseDbml(dbml)
    
    // Add onAddColumn to each node
    parsedNodes = parsedNodes.map(node => ({
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
                      columns: [...node.data.columns, { name, type }] 
                    } 
                  }
                : node
            )
          )
        }
      }
    }))
    
    setNodes(parsedNodes)
    localStorage.removeItem("dbml")
  }
}, [])


  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [])

  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])

  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [])

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
                    columns: [...node.data.columns, { name, type }] 
                  } 
                }
              : node
          )
        )
      }
    },
  }
  setNodes((nds) => [...nds, newNode])
}, [])

  const handleKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === "a") {
        event.preventDefault()
        addTable()
      }
    },
    [addTable],
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
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

