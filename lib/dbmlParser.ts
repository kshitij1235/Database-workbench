export function parseDbml(dbml: string) {
  const tables = dbml.split("Table").filter(Boolean)
  return tables.map((table, index) => {
    const lines = table.trim().split("\n")
    const tableName = lines[0].split("{")[0].trim()
    const columns = lines.slice(1, -1).map((line) => {
      const [name, type] = line.trim().split(" ")
      return { name, type }
    })

    return {
      id: `table-${index}`,
      type: "table",
      position: { x: index * 250, y: 100 },
      data: { label: tableName, columns },
    }
  })
}

