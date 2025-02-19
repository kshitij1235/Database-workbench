import type { Metadata } from "next"
import "./globals.css"
import { ToasterComponent } from "@/components/ui/toastersooner"

export const metadata: Metadata = {
  title: "Database Workbench",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToasterComponent/>
      </body>
    </html>
  )
}
