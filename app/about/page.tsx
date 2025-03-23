import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="max-w-3xl w-full">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-6">About This App</h1>

        <div className="space-y-6 text-lg">
          <p>
            This is a basic Next.js application built with the App Router. Next.js is a React framework that enables
            functionality such as server-side rendering and static site generation.
          </p>

          <p>
            The App Router is the newest routing system in Next.js, providing a more intuitive and powerful way to build
            applications with features like:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Server Components for improved performance</li>
            <li>Nested layouts that persist across page navigation</li>
            <li>Simplified data fetching with async/await in components</li>
            <li>Built-in support for loading and error states</li>
            <li>Simplified route handling with file-system based routing</li>
          </ul>

          <p>
            This example demonstrates basic navigation between pages and a simple responsive layout using Tailwind CSS.
          </p>
        </div>
      </div>
    </main>
  )
}

