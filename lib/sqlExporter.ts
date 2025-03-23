export function exportToSql(nodes, edges) {
  let sql = ""

  // Generate CREATE TABLE statements
  nodes.forEach((node) => {
    sql += `CREATE TABLE ${node.data.label} (\n`

    // Process all columns
    node.data.columns.forEach((column, index) => {
      // Start with column name and type
      sql += `  ${column.name} ${column.type ? column.type.toUpperCase() : "UNKNOWN"}`

      // Add column constraints
      if (column.isNotNull) {
        sql += " NOT NULL"
      }

      if (column.isUnique) {
        sql += " UNIQUE"
      }

      if (column.isPrimaryKey) {
        sql += " PRIMARY KEY"
      }

      if (column.isAutoIncrement) {
        sql += " AUTO_INCREMENT"
      }

      if (column.defaultValue) {
        sql += ` DEFAULT ${column.defaultValue}`
      }

      if (column.checkConstraint) {
        sql += ` CHECK (${column.checkConstraint})`
      }

      // Add comma if not the last column
      if (index < node.data.columns.length - 1) {
        sql += ","
      }
      sql += "\n"
    })

    sql += ");\n\n"

    // Add indexes for columns marked as indexed but not primary keys
    node.data.columns.forEach((column) => {
      if (column.isIndexed && !column.isPrimaryKey) {
        sql += `CREATE INDEX idx_${node.data.label}_${column.name} ON ${node.data.label}(${column.name});\n`
      }
    })

    if (node.data.columns.some((col) => col.isIndexed && !col.isPrimaryKey)) {
      sql += "\n"
    }
  })

  // Generate FOREIGN KEY constraints
  edges.forEach((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source)
    const targetNode = nodes.find((node) => node.id === edge.target)

    if (sourceNode && targetNode) {
      // Extract actual column names from handles
      const sourceColumn = edge.sourceHandle.split("-")[1] // Get column name from handle
      const targetColumn = edge.targetHandle.split("-")[1]

      if (sourceColumn && targetColumn) {
        // Check if the source column is a primary key in its table
        const sourceColumnObj = sourceNode.data.columns.find((col) => col.name === sourceColumn)

        sql += `ALTER TABLE ${targetNode.data.label}\n`
        sql += `ADD CONSTRAINT fk_${targetNode.data.label}_${targetColumn} FOREIGN KEY (${targetColumn}) REFERENCES ${sourceNode.data.label}(${sourceColumn});\n\n`
      }
    }
  })

  return sql
}

