import type { Metadata } from "next"
import "../styles/globals.css"
import { ToasterComponent } from "@/components/ui/toastersooner"
import { ThemeProvider } from "@/components/theme-provider"
export const metadata: Metadata = {
  title: 'Database_Workbench',
  description: 'Let you design database.',
  generator: '',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>

      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        <ToasterComponent/>
        </ThemeProvider>
      </body>
    </html>
  )
}
