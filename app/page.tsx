"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import convertSqlToDbml from "@/lib/sqlToDbml"

export default function Home() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setTheme("light")
  }, [setTheme])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return alert("No file selected")

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = async () => {
      if (typeof reader.result !== "string") return alert("Failed to read the SQL file")

      try {
        console.log("SQL File Content:", reader.result)
        const dbml = await convertSqlToDbml(reader.result)
        console.log("Converted DBML:", dbml)

        localStorage.setItem("dbml", dbml)
        router.push("/workbench")
      } catch (error) {
        console.error("Conversion error:", error)
        alert("Error converting SQL to DBML.")
      } finally {
        setIsUploading(false)
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white p-4">
      <h1 className="mb-4 text-4xl font-bold text-blue-800">Database Workbench</h1>
      <p className="mb-8 text-xl text-center text-gray-600 max-w-2xl">
        Design, visualize, and manage your database schemas with ease. Import existing SQL structures or create new ones
        from scratch using our intuitive node-based interface.
      </p>
      <div className="grid gap-6 md:grid-cols-2 mb-12">
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
              <Button className="w-full flex items-center justify-center" disabled={isUploading} asChild>
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
      <div className="flex space-x-4">
        <a href="https://github.com/kshitij1235" target="_blank" rel="noopener noreferrer">
          <Github className="h-6 w-6 text-gray-600 hover:text-blue-600" />
        </a>
        <a href="https://in.linkedin.com/in/kshitij-jathar-9469b9224" target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-6 w-6 text-gray-600 hover:text-blue-700" />
        </a>
      </div>
    </div>
  )
}

