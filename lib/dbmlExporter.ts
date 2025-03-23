export function exportToDbml(nodes, edges) {
  let dbml = ""

  // Process all tables
  nodes.forEach((node) => {
    dbml += `Table ${node.data.label} {\n`

    // Process all columns with their properties
    node.data.columns.forEach((column) => {
      // Start with column name and type
      dbml += `  ${column.name} ${column.type}`

      // Add column attributes
      const attributes = []

      if (column.isPrimaryKey) {
        attributes.push("pk")
      }

      if (column.isNotNull) {
        attributes.push("not null")
      }

      if (column.isUnique) {
        attributes.push("unique")
      }

      if (column.isAutoIncrement) {
        attributes.push("increment")
      }

      if (column.defaultValue) {
        attributes.push(`default: ${column.defaultValue}`)
      }

      if (column.isIndexed && !column.isPrimaryKey) {
        attributes.push("index")
      }

      if (column.checkConstraint) {
        attributes.push(`check: ${column.checkConstraint}`)
      }

      // Add attributes if any exist
      if (attributes.length > 0) {
        dbml += ` [${attributes.join(", ")}]`
      }

      dbml += "\n"
    })

    dbml += "}\n\n"
  })

  // Process all relationships
  edges.forEach((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source)
    const targetNode = nodes.find((node) => node.id === edge.target)

    if (sourceNode && targetNode) {
      // Extract column names from handles
      const sourceColumn = edge.sourceHandle.split("-")[1] // Get column name from handle
      const targetColumn = edge.targetHandle.split("-")[1]

      // Create relationship with proper syntax
      dbml += `Ref: ${sourceNode.data.label}.${sourceColumn} > ${targetNode.data.label}.${targetColumn}`

      // Add relationship attributes if they exist
      if (edge.data && edge.data.options) {
        dbml += ` [${edge.data.options}]`
      }

      dbml += "\n"
    }
  })

  return dbml
}

