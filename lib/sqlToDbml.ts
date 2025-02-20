import { parse } from 'sql-parser-mastic';

interface Column {
  name: string;
  type: string;
  constraints: string[];
}

interface Table {
  name: string;
  columns: Column[];
}

export function convertSqlToDbml(sql: string, dialect: "mysql" | "postgres"): string {
  try {
    console.log("Starting SQL to DBML conversion...");
    
    // Extract CREATE TABLE statements using regex
    const tableRegex = /CREATE\s+TABLE\s+(?:`|"|')?(\w+)(?:`|"|')?\s*\(([\s\S]*?)\)/gi;
    let match;
    const tables: Table[] = [];
    
    // Process each table
    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const columnsText = match[2];
      
      // Parse columns
      const columnRegex = /\s*(?:`|"|')?(\w+)(?:`|"|')?\s+([A-Za-z0-9()]+)(?:\s+(.*?))?(?:,|$)/g;
      let columnMatch;
      const columns: Column[] = [];
      
      let columnText = columnsText.split(',');
      for (const colLine of columnText) {
        if (!colLine.trim()) continue;
        
        // Basic parsing of column definition
        const parts = colLine.trim().split(/\s+/);
        if (parts.length < 2) continue;
        
        const name = parts[0].replace(/`|"|'/g, '');
        const type = parts[1];
        
        // Extract constraints
        const constraints: string[] = [];
        if (colLine.toUpperCase().includes('PRIMARY KEY')) {
          constraints.push('pk');
        }
        if (colLine.toUpperCase().includes('NOT NULL')) {
          constraints.push('not null');
        }
        
        columns.push({ name, type, constraints });
      }
      
      tables.push({ name: tableName, columns });
    }
    
    // Generate DBML
    let dbml = "";
    
    for (const table of tables) {
      dbml += `Table ${table.name} {\n`;
      
      for (const column of table.columns) {
        dbml += `  ${column.name} ${column.type}`;
        
        if (column.constraints.includes('pk')) {
          dbml += ' [pk]';
        }
        if (column.constraints.includes('not null')) {
          dbml += ' [not null]';
        }
        
        dbml += '\n';
      }
      
      dbml += '}\n\n';
    }
    
    return dbml ;
  } catch (error) {
    console.error("Conversion error:", error);
    return `// Error converting SQL to DBML: ${error.message}\n// Manual conversion may be required`;
  }
}