"use client"

import { MoreHorizontal, Key, List, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ColumnActionsMenuProps {
  isPrimaryKey: boolean
  isIndexed: boolean
  onTogglePrimaryKey: () => void
  onToggleIndex: () => void
  onDelete: () => void
}

export function ColumnActionsMenu({
  isPrimaryKey,
  isIndexed,
  onTogglePrimaryKey,
  onToggleIndex,
  onDelete,
}: ColumnActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onTogglePrimaryKey}>
          <Key className={`mr-2 h-4 w-4 ${isPrimaryKey ? "text-yellow-500" : ""}`} />
          <span>{isPrimaryKey ? "Remove Primary Key" : "Set as Primary Key"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleIndex}>
          <List className={`mr-2 h-4 w-4 ${isIndexed ? "text-blue-500" : ""}`} />
          <span>{isIndexed ? "Remove Index" : "Create Index"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Column</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

