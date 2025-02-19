import type { Metadata } from "next"
import "./globals.css"
import { ToasterComponent } from "@/components/ui/toastersooner"

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Database_Workbench',
  description: 'Let you design database.',
  generator: '',
=======
  title: "Database Workbench",
  description: "Created with v0",
  generator: "v0.dev",
>>>>>>> 3a3ca511f2ddc8db5b9451b5a3d730faaaf75e2b
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
