export function exportToSql(nodes, edges) {
  let sql = ""

  // Generate CREATE TABLE statements
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

  // Generate FOREIGN KEY constraints
  edges.forEach((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source)
    const targetNode = nodes.find((node) => node.id === edge.target)

    if (sourceNode && targetNode) {
      // Extract actual column names from handles
      const sourceColumn = edge.sourceHandle.split("-").slice(1, -1).join("_") // Get column name from handle
      const targetColumn = edge.targetHandle.split("-").slice(1, -1).join("_") 

      if (sourceColumn && targetColumn) {
        sql += `ALTER TABLE ${targetNode.data.label}\n`
        sql += `ADD CONSTRAINT fk_${targetNode.data.label}_${targetColumn} FOREIGN KEY (${targetColumn.split("_", 2)[1] || ""}) REFERENCES ${sourceNode.data.label}(${sourceColumn.split("_", 2)[1] || ""});\n\n`
      }
    }
  })

  return sql
}
