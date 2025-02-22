"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import convertSqlToDbml from "@/lib/sqlToDbml";

export default function Home() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);

  // Ensure theme is set to light mode on mount
  useEffect(() => {
    setTheme("light");
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return alert("No file selected");

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      if (typeof reader.result !== "string") return alert("Failed to read the SQL file");

      try {
        console.log("SQL File Content:", reader.result); // Debug log
        const dbml = await convertSqlToDbml(reader.result);
        console.log("Converted DBML:", dbml); // Debug log

        localStorage.setItem("dbml", dbml);
        router.push("/workbench");
      } catch (error) {
        console.error("Conversion error:", error);
        alert("Error converting SQL to DBML.");
      } finally {
        setIsUploading(false);
      }
    };

    // ✅ Call readAsText AFTER defining onload
    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white p-4">
      <h1 className="mb-8 text-4xl font-bold text-blue-800">Database Workbench</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload SQL File Card */}
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Upload SQL File</CardTitle>
            <CardDescription>Import an existing database structure</CardDescription>
          </CardHeader>
          <CardContent>
            <label htmlFor="fileinput" className="w-full">
              <input id="fileinput" type="file" accept=".sql" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              <Button className="w-full flex items-center justify-center" disabled={isUploading} asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Converting..." : "Choose SQL File"}
                </span>
              </Button>
            </label>
          </CardContent>
        </Card>

        {/* Design New Database Card */}
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Design New Database</CardTitle>
            <CardDescription>Start from scratch</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/workbench")}>
              Create New Database
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
