import { Parser } from 'node-sql-parser';

interface Column {
  name: string;
  type: string;
  constraints: string[];
}

interface ForeignKey {
  column: string;
  refTable: string;
  refColumn: string;
}

interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
}

export function convertSqlToDbml(sql: string, dialect: "mysql" | "postgres"): string {
  try {
    console.log("Starting SQL to DBML conversion...");
    const parser = new Parser();
    const ast = parser.astify(sql, { database: dialect });

    const tables: Table[] = [];

    for (const statement of Array.isArray(ast) ? ast : [ast]) {
      if (statement.type !== 'create') continue; // Ignore non-CREATE statements

      const tableName = statement.table[0].table;
      const columns: Column[] = [];
      const foreignKeys: ForeignKey[] = [];

      for (const columnDef of statement.create_definitions) {
        if (columnDef.resource === 'column') {
          // Extract column details
          const name = columnDef.column.column;
          const type = columnDef.definition.dataType.toUpperCase();
          const constraints: string[] = [];

          if (columnDef.constraint?.primary_key) constraints.push('pk');
          if (columnDef.definition.nullable === 'NOT NULL') constraints.push('not null');

          columns.push({ name, type, constraints });
        } 
        else if (columnDef.resource === 'constraint' && columnDef.constraint_type === 'foreign key') {
          // Handle Foreign Keys
          foreignKeys.push({
            column: columnDef.definition.column[0].column,
            refTable: columnDef.reference.table[0].table,
            refColumn: columnDef.reference.column[0].column,
          });
        }
      }

      tables.push({ name: tableName, columns, foreignKeys });
    }

    // Generate DBML output
    let dbml = "";
    for (const table of tables) {
      dbml += `Table ${table.name} {\n`;
      for (const column of table.columns) {
        dbml += `  ${column.name} ${column.type}`;
        if (column.constraints.length) {
          dbml += ` [${column.constraints.join(", ")}]`;
        }
        dbml += "\n";
      }
      dbml += "}\n\n";

      // Add Foreign Key Relationships
      for (const fk of table.foreignKeys) {
        dbml += `Ref: ${table.name}.${fk.column} > ${fk.refTable}.${fk.refColumn}\n`;
      }
      dbml += "\n";
    }

    return dbml;
  } catch (error :any) {
    console.error("Conversion error:", error);
    return error.message;
  }
}
