"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileDown, FileCode, ChevronDown } from "lucide-react"

interface ExportDropdownProps {
  onExportDbml: () => void
  onExportSql: () => void
}

export function ExportDropdown({ onExportDbml, onExportSql }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onExportDbml} className="gap-2">
          <FileCode className="h-4 w-4" />
          <span>Export as DBML</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportSql} className="gap-2">
          <FileDown className="h-4 w-4" />
          <span>Export as SQL</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

