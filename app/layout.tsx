import type { Metadata } from "next"
import "./globals.css"
import { ToasterComponent } from "@/components/ui/toastersooner"

export const metadata: Metadata = {
  title: 'Database_Workbench',
  description: 'Let you design database.',
  generator: '',
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
