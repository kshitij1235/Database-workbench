"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  Github,
  Linkedin,
  Database,
  Code,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  Moon,
  Sun,
  FileText,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useTheme } from "next-themes"
import convertSqlToDbml from "@/lib/sqlToDbml"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isUploading, setIsUploading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return alert("No file selected")

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = async () => {
      if (typeof reader.result !== "string") return alert("Failed to read the SQL file")

      try {
        console.log("SQL File Content:", reader.result)
        const { dbml, relationships } = await convertSqlToDbml(reader.result)
        console.log("Converted DBML:", dbml)
        console.log("Extracted Relationships:", relationships)

        localStorage.setItem("dbmlData", JSON.stringify({ dbml, relationships }))
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const hoverScale = {
    scale: 1.03,
    transition: { duration: 0.2 },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between p-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Database className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DB Workbench</span>
          </motion.div>
          <nav className="hidden md:flex items-center justify-center gap-6">
            <motion.a
              href="#get-started"
              className="text-sm font-medium hover:text-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Get Started
            </motion.a>
            <motion.a
              href="#features"
              className="text-sm font-medium hover:text-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Features
            </motion.a>
            <motion.a
              href="#about"
              className="text-sm font-medium hover:text-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              About
            </motion.a>
            <motion.a
              href="#faq"
              className="text-sm font-medium hover:text-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              FAQ
            </motion.a>
          </nav>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <a href="https://forms.gle/cuL81fAQauQ9yRvp7" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedback
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section with Direct Action Pills */}
      <section className="container px-4 py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center justify-items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Badge className="mb-4">Version 1.0</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Database Design <span className="text-primary">Simplified</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-[600px]">
              Design, visualize, and manage your database schemas with our intuitive node-based interface. Currently{" "}
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeIn} whileHover={hoverScale}>
                <label htmlFor="hero-fileinput" className="w-full">
                  <input
                    id="hero-fileinput"
                    type="file"
                    accept=".sql"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button size="lg" className="flex items-center" asChild>
                    <span>
                      <Upload className="mr-2 h-5 w-5" />
                      Import SQL File
                    </span>
                  </Button>
                </label>
              </motion.div>
              <motion.div variants={fadeIn} whileHover={hoverScale}>
                <Button
                  size="lg"
                  className="flex items-center"
                  variant="outline"
                  onClick={() => router.push("/workbench")}
                >
                  <Database className="mr-2 h-5 w-5" />
                  Create New Database
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <a href="#" className="text-primary hover:underline flex items-center text-sm">
                <FileText className="mr-2 h-4 w-4" />
                Watch Tutorial (Coming Soon)
              </a>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative rounded-lg overflow-hidden border shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            whileHover={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <img src="heropage.gif?height=600&width=800" alt="Database Workbench Interface" className="w-full h-auto" />
          </motion.div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="bg-muted/50 py-12 md:py-16">
        <div className="container px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Start Using DB Workbench Now</h2>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              Import your existing database structure or start fresh in seconds
            </p>
          </motion.div>
          <motion.div
            className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} whileHover={hoverScale}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="mr-2 h-5 w-5 text-primary" />
                    Import Existing Database
                  </CardTitle>
                  <CardDescription>Upload your SQL file and we'll convert it automatically</CardDescription>
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
                <CardFooter className="text-sm text-muted-foreground">
                  Supports MySQL, PostgreSQL, and SQL Server formats
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn} whileHover={hoverScale}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5 text-primary" />
                    Create New Database
                  </CardTitle>
                  <CardDescription>Start from scratch with our visual designer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => router.push("/workbench")}>
                    Create New Database
                  </Button>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">No prior database knowledge required</CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container px-4 py-16">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
            Everything you need to design and manage your database schemas
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 place-items-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Visual Schema Designer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Drag-and-drop interface for creating tables, columns, and relationships without writing a single line
                  of SQL.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <Code className="h-10 w-10 text-primary mb-2" />
                <CardTitle>SQL Import & Export</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Import existing SQL schemas and export your designs to SQL, ready for implementation in any database
                  system.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <Database className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multi-Database Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Works with MySQL, PostgreSQL, SQL Server, SQLite, and more. Design once, deploy anywhere.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Client-Side Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All processing happens in your browser - your database schemas stay private and secure on your device.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Validation & Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatic validation ensures your schema follows best practices and avoids common pitfalls.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <ArrowRight className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Features (Coming Soon)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-powered schema optimization, documentation generation, and query suggestions coming in future
                  updates.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-muted/50 py-16">
        <div className="container px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center justify-items-center text-center">
            <motion.div
              className="relative rounded-lg overflow-hidden border shadow-xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src="/heropage1.gif?height=600&width=800" alt="Our Team" className="w-full h-auto" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">About DB Workbench</h2>
              <p className="text-lg text-muted-foreground mb-6">
                DB Workbench was born out of frustration with existing database design tools. As developers ourselves,
                we wanted something that was powerful yet intuitive, visual yet precise.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our mission is to simplify database design and management for developers of all skill levels. Whether
                you're a seasoned DBA or just starting out, our tools help you create better database schemas faster.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Currently, DB Workbench is completely free to use. We're working on advanced AI-powered features that
                will be available in premium plans in the future, but our core functionality will always remain
                accessible.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <a href="https://github.com/kshitij1235" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="flex items-center">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coming Soon / Free Now Section */}
      <section className="container px-4 py-16 text-center">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4">Coming Soon</Badge>
          <h2 className="text-3xl font-bold mb-4">AI-Powered Features</h2>
          <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
            We're working on advanced AI features to make database design even easier. DB Workbench is completely free
            now, with premium AI features coming in the future.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <CardTitle>AI Schema Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get intelligent suggestions to optimize your database schema for performance and scalability.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <CardTitle>Auto Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate comprehensive documentation for your database schema with a single click.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} whileHover={hoverScale}>
            <Card className="bg-background h-full">
              <CardHeader>
                <CardTitle>Query Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get intelligent query suggestions based on your schema structure and common access patterns.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-muted/50 py-16">
        <div className="container px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              Find answers to common questions about DB Workbench
            </p>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What database systems are supported?</AccordionTrigger>
                <AccordionContent>
                  DB Workbench supports all major database systems including MySQL, PostgreSQL, SQL Server, SQLite,
                  Oracle, and MongoDB. You can design your schema once and export it to any of these formats.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Is DB Workbench really free?</AccordionTrigger>
                <AccordionContent>
                  Yes! DB Workbench is currently 100% free to use. We're working on advanced AI features that will be
                  part of premium plans in the future, but the core functionality will always remain accessible.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. DB Workbench runs entirely in your browser - your database schemas stay on your device and
                  are never sent to our servers. This ensures complete privacy and security for your sensitive database
                  designs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Can I import my existing database?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can import existing databases by uploading SQL files. DB Workbench will automatically create
                  a visual representation of your schema that you can then modify as needed.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>When will the AI features be available?</AccordionTrigger>
                <AccordionContent>
                  We're actively working on our AI-powered features and expect to release them in the coming months.
                  Sign up for our newsletter to be the first to know when they're available.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-3 text-center place-items-center">
            <div>
              <div className="flex items-center gap-2 mb-4 justify-center">
                <Database className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">DB Workbench</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Design, visualize, and manage your database schemas with ease.
              </p>
              <div className="flex space-x-4 justify-center">
                <a href="https://github.com/kshitij1235" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </a>
                <a href="https://in.linkedin.com/in/kshitij-jathar-9469b9224" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Documentation (Coming Soon)
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Tutorial Video (Coming Soon)
                  </a>
                </li>
                <li>
                  <a
                    href="https://forms.gle/YourGoogleFormLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Feedback Form
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-muted-foreground hover:text-primary">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com/kshitij1235/Database-workbench/blob/master/LICENSE"
                    className="text-muted-foreground hover:text-primary"
                  >
                    License: Creative Commons Zero v1.0 Universal
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DB Workbench. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

