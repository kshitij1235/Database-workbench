import Link from "next/link"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
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
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Choose SQL File
            </Button>
          </CardContent>
        </Card>
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Design New Database</CardTitle>
            <CardDescription>Start from scratch</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/workbench" passHref>
              <Button className="w-full">Create New Database</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

