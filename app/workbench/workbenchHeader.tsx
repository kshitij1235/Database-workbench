"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Database, HelpCircle } from "lucide-react"
import { ExportDropdown } from "./exportOptionDropDown"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

interface WorkbenchHeaderProps {
  onExportDbml: () => void
  onExportSql: () => void
}

export function WorkbenchHeader({ onExportDbml, onExportSql }: WorkbenchHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <TooltipProvider>
      <header className="flex items-center justify-between h-12 px-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="flex items-center gap-1.5 text-primary hover:text-primary/90 transition-colors"
            aria-label="Go to Workbench home"
          >
            <Database className="h-4 w-4" />
            <span className="font-semibold text-base">Workbench</span>
          </a>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ExportDropdown onExportDbml={onExportDbml} onExportSql={onExportSql} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Export your schema</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 transition-transform hover:rotate-12" />
                ) : (
                  <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{theme === "dark" ? "Light mode" : "Dark mode"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  )
}

