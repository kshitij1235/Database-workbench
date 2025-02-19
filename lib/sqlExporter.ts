export function exportToSql(nodes, edges) {
  let sql = ""

  nodes.forEach((node) => {
    sql += `CREATE TABLE ${node.data.label} (\n`
    node.data.columns.forEach((column, index) => {
      sql += `  ${column.name} ${column.type.toUpperCase()}`
      if (index < node.data.columns.length - 1) {
        sql += ","
      }
      sql += "\n"
    })
    sql += ");\n\n"
  })

  edges.forEach((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source)
    const targetNode = nodes.find((node) => node.id === edge.target)
    if (sourceNode && targetNode) {
      const sourceColumn = edge.sourceHandle.split("-")[1]
      const targetColumn = edge.targetHandle.split("-")[1]
      sql += `ALTER TABLE ${targetNode.data.label}\n`
      sql += `ADD FOREIGN KEY (${targetColumn}) REFERENCES ${sourceNode.data.label}(${sourceColumn});\n\n`
    }
  })

  return sql
}

