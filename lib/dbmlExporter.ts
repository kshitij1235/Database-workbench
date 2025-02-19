export function exportToDbml(nodes, edges) {
  let dbml = ""

  nodes.forEach((node) => {
    dbml += `Table ${node.data.label} {\n`
    node.data.columns.forEach((column) => {
      dbml += `  ${column.name} ${column.type}\n`
    })
    dbml += "}\n\n"
  })

  edges.forEach((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source)
    const targetNode = nodes.find((node) => node.id === edge.target)
    if (sourceNode && targetNode) {
      dbml += `Ref: ${sourceNode.data.label}.${edge.sourceHandle.split("-")[1]} > ${targetNode.data.label}.${edge.targetHandle.split("-")[1]}\n`
    }
  })

  return dbml
}

