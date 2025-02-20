"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { convertSqlToDbml } from "@/lib/sqlToDbml"
import { useTheme } from "next-themes"

export default function Home() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Set the theme to light
  setTheme("light")
  
  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault() // Prevent accidental form submission
    
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      alert("No file selected");
      return;
    }

    setIsUploading(true)

    const reader = new FileReader()
    
    reader.onload = async function () {
      const sql = reader.result

      if (sql && typeof sql === "string") {
        try {
          const dbml = await convertSqlToDbml(sql)
          localStorage.setItem("dbml", dbml)
          router.push("/workbench")
        } catch (error) {
          console.error("Error converting SQL to DBML:", error)
          alert("Error converting SQL to DBML. Please check your SQL file.")
        } finally {
          setIsUploading(false)
        }
      } else {
        console.error("Failed to read the SQL file");
        alert("Failed to read the SQL file");
        setIsUploading(false);
      }
    }

    reader.onerror = function (error) {
      console.error("Error reading file:", error)
      alert("There was an error reading the file");
      setIsUploading(false);
    }

    reader.readAsText(file) // Read the file as text
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white p-4">
      <h1 className="mb-8 text-4xl font-bold text-blue-800">Database Workbench</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Upload SQL File</CardTitle>
            <CardDescription>Import an existing database structure</CardDescription>
          </CardHeader>
          <CardContent>
          <label htmlFor="fileinput" className="w-full">
  <input
    id="fileinput"
    type="file"
    accept=".sql"
    className="hidden"
    onChange={handleFileUpload}
    disabled={isUploading}
  />
  <Button className="w-full flex items-center justify-center" asChild disabled={isUploading}>
    <span>
      <Upload className="mr-2 h-4 w-4" />
      {isUploading ? "Converting..." : "Choose SQL File"}
    </span>
  </Button>
</label>

          </CardContent>
        </Card>
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
  )
}
