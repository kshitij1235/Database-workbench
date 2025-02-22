import { importer } from '@dbml/core';
import path from 'path';

// Define types for input paths
type InputPaths = string | string[];

// Function to resolve paths, ensuring all paths are absolute paths
function resolvePaths(paths: InputPaths): string | string[] {
    if (!Array.isArray(paths)) {
        return path.resolve(process.cwd(), paths);
    }
    return paths.map((_path) => path.resolve(process.cwd(), _path));
}

// Class to handle writing to an output string
class OutputStringPlugin {
    private content: string;

    constructor() {
        this.content = '';
    }

    // Method to write data into the content
    write(data: string): void {
        this.content += data;
    }

    // Method to get the current content
    getContent(): string {
        return this.content;
    }
}

// Function to generate DBML text from SQL input
async function generate(input: string, transform: (sql: string) => Promise<any>, outputPlugin: OutputStringPlugin): Promise<void> {
    try {
        const content = await transform(input);  // Await the promise returned by transform
        outputPlugin.write(content);  // Write the content to the plugin
    } catch (e: any) {
        console.error("Error details:", e);
        throw e;
    }
}

/**
 * Converts MySQL text to DBML text.
 * 
 * @param {string} mysqlText - The MySQL text to convert.
 * @returns {Promise<string>} The DBML output as a string. Rejects with an error message if conversion fails.
 */
async function convertSqlToDbml(mysqlText: string): Promise<string> {
    try {
        const outputPlugin = new OutputStringPlugin();

        // Use the generate function to process the input
        await generate(mysqlText, (sql: string) => {
            return new Promise((resolve, reject) => {
                try {
                    // Use the importer to convert SQL to DBML
                    const result = importer.import(sql, 'mysql');
                    resolve(result);  // Resolve with the DBML result
                } catch (error) {
                    reject(error);  // Reject if an error occurs
                }
            });
        }, outputPlugin);

        // Log the final content to inspect what is being returned
        let finalContent = outputPlugin.getContent();
        console.log("Final DBML Content:", finalContent);

        // Regular expression to extract the content of tables (ignores everything outside)
        const tableRegex = /Table\s+"([\w\d_]+)"\s*\{([\s\S]*?)\}/g;

        let match;
        let result = '';

        // Loop through all matches for tables
        while ((match = tableRegex.exec(finalContent)) !== null) {
            const tableName = match[1];
            const tableContent = match[2];

            // Process columns, filtering out anything that's not a column definition
            const columnRegex = /"([\w\d_]+)"\s+([\w\d(),]+)\s*(?:\[.*\])?/g;
            let columnMatch;
            let columns: string[] = [];

            while ((columnMatch = columnRegex.exec(tableContent)) !== null) {
                const columnName = columnMatch[1];
                const columnType = columnMatch[2];
                columns.push(`${columnName}: ${columnType}`);
            }

            // Add the table and its columns to the result
            result += `Table ${tableName} {\n  ${columns.join('\n  ')}\n}\n`;
        }

        // Log the final cleaned DBML content
        console.log("Cleaned DBML Content:", result);

        return result;
    } catch (error) {
        console.error("Conversion error:", error);
        throw error;
    }
}

export default convertSqlToDbml;
