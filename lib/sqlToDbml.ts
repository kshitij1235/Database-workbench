import { importer } from "@dbml/core";
import path from "path";

type InputPaths = string | string[];

function resolvePaths(paths: InputPaths): string | string[] {
  if (!Array.isArray(paths)) {
    return path.resolve(process.cwd(), paths);
  }
  return paths.map((_path) => path.resolve(process.cwd(), _path));
}

class OutputStringPlugin {
  private content: string;

  constructor() {
    this.content = "";
  }

  write(data: string): void {
    this.content += data;
  }

  getContent(): string {
    return this.content;
  }
}

async function generate(
  input: string,
  transform: (sql: string) => Promise<any>,
  outputPlugin: OutputStringPlugin
): Promise<void> {
  try {
    const content = await transform(input);
    outputPlugin.write(content);
  } catch (e: any) {
    console.error("Error details:", e);
    throw e;
  }
}

interface ForeignKeyRelationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  direction: ">" | "<";
  options?: string;
}

async function convertSqlToDbml(
  mysqlText: string
): Promise<{ dbml: string; relationships: ForeignKeyRelationship[] }> {
  try {
    const outputPlugin = new OutputStringPlugin();

    await generate(
      mysqlText,
      (sql: string) => {
        return new Promise((resolve, reject) => {
          try {
            const result = importer.import(sql, "mysql");
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      },
      outputPlugin
    );

    const finalContent = outputPlugin.getContent();
    console.log("DBML Content Before Relationship Extraction:\n", finalContent);

    const tableRegex = /Table\s+"?([\w\d_]+)"?\s*\{([\s\S]*?)\}/g;
    const relationshipRegex =
      /Ref\s*"?([\w\d_]+)"?\s*:\s*"?([\w\d_]+)"?\."?([\w\d_]+)"?\s*([<>])\s*"?([\w\d_]+)"?\."?([\w\d_]+)"?(\s*\[.*?\])?/g;

    let match;
    let result = "";
    const relationships: ForeignKeyRelationship[] = [];

    // Extract Tables
    while ((match = tableRegex.exec(finalContent)) !== null) {
      const tableName = match[1];
      const tableContent = match[2];

      const columnRegex = /"([\w\d_]+)"\s+([\w\d(),]+)\s*(?:\[.*?\])?/g;
      let columnMatch;
      const columns: string[] = [];

      while ((columnMatch = columnRegex.exec(tableContent)) !== null) {
        const columnName = columnMatch[1];
        const columnType = columnMatch[2];
        const isPrimaryKey = tableContent.includes(`"${columnName}" [pk]`);
        columns.push(`${columnName} ${columnType}${isPrimaryKey ? " [pk]" : ""}`);
      }

      result += `Table ${tableName} {\n  ${columns.join("\n  ")}\n}\n\n`;
    }

    // Debugging the extraction of relationships more thoroughly
    console.log("Trying to extract relationships...");

    // Extract Relationships with updated regex
    while ((match = relationshipRegex.exec(finalContent)) !== null) {
      console.log("Relationship match found:", match); // Debug each match

      const [, fkName, sourceTable, sourceColumn, direction, targetTable, targetColumn, options] = match;

      const relationship: ForeignKeyRelationship = {
        sourceTable,
        sourceColumn,
        targetTable,
        targetColumn,
        direction: direction === ">" ? ">" : "<",
        options: options ? options.trim() : "",
      };

      relationships.push(relationship);

      // Append relationships to result
      result += `Ref: ${sourceTable}.${sourceColumn} ${relationship.direction} ${targetTable}.${targetColumn}${relationship.options ? ` ${relationship.options}` : ""}\n`;
    }

    console.log("Final Processed DBML with Relationships:\n", result);
    console.log("Extracted Relationships:", relationships);

    return { dbml: result, relationships };
  } catch (error) {
    console.error("Conversion error:", error);
    throw error;
  }
}

export default convertSqlToDbml;
