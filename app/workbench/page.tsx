"use client"

import { useState, useCallback } from "react"
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow"
import "reactflow/dist/style.css"
import { TableNode } from "@/components/table-node"
import { Sidebar } from "@/components/sidebar"

const nodeTypes = {
  table: TableNode,
}

export default function Workbench() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [])

  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])

  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [])

  const addColumn = useCallback((tableId, columnName, columnType) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === tableId) {
          const newColumn = { name: columnName, type: columnType }
          return {
            ...node,
            data: {
              ...node.data,
              columns: [...node.data.columns, newColumn],
              onAddColumn: addColumn, // Pass the function to the node
            },
          }
        }
        return node
      }),
    )
  }, [])

  const addTable = useCallback(
    (tableName) => {
      const newNode = {
        id: `table-${Date.now()}`,
        type: "table",
        position: { x: 100, y: 100 },
        data: { label: tableName, columns: [], onAddColumn: addColumn },
      }
      setNodes((nds) => [...nds, newNode])
    },
    [addColumn],
  )

  return (
    <div className="flex h-screen">
      <Sidebar onAddTable={addTable} />
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
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}

