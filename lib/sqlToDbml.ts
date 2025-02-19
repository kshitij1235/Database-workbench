const { Parser } = require("node-sql-parser")

export async function convertSqlToDbml(sql: string): Promise<string> {
  const parser = new Parser() // Use Parser instead of SQLParser
  const ast = parser.astify(sql)

  let dbml = ""

  if (Array.isArray(ast)) {
    ast.forEach((statement) => {
      if (statement.type === "create") {
        const tableName = statement.table[0].table
        dbml += `Table ${tableName} {\n`

        statement.create_definitions.forEach((column) => {
          if (column.resource === "column") {
            const columnName = column.column.column
            const columnType = column.definition.dataType.toLowerCase()
            dbml += `  ${columnName} ${columnType}`

            if (column.definition.primary_key) {
              dbml += " [pk]"
            }

            dbml += "\n"
          }
        })

        dbml += "}\n\n"
      }
    })
  } else if (ast.type === "create") {
    // Handle single statement
    const tableName = ast.table[0].table
    dbml += `Table ${tableName} {\n`

    ast.create_definitions.forEach((column) => {
      if (column.resource === "column") {
        const columnName = column.column.column
        const columnType = column.definition.dataType.toLowerCase()
        dbml += `  ${columnName} ${columnType}`

        if (column.definition.primary_key) {
          dbml += " [pk]"
        }

        dbml += "\n"
      }
    })

    dbml += "}\n\n"
  }

  return dbml
}

