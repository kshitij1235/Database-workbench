"use client"

import { MoreHorizontal, Key, List, Trash2, AlertCircle, Lock, Hash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ColumnActionsMenuProps {
  isPrimaryKey: boolean
  isIndexed: boolean
  isNotNull?: boolean
  isUnique?: boolean
  isAutoIncrement?: boolean
  onTogglePrimaryKey: () => void
  onToggleIndex: () => void
  onToggleNotNull?: () => void
  onToggleUnique?: () => void
  onToggleAutoIncrement?: () => void
  onDelete: () => void
}

export function ColumnActionsMenu({
  isPrimaryKey,
  isIndexed,
  isNotNull = false,
  isUnique = false,
  isAutoIncrement = false,
  onTogglePrimaryKey,
  onToggleIndex,
  onToggleNotNull,
  onToggleUnique,
  onToggleAutoIncrement,
  onDelete,
}: ColumnActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onTogglePrimaryKey}>
            <Key className={`mr-2 h-4 w-4 ${isPrimaryKey ? "text-yellow-500" : ""}`} />
            <span>{isPrimaryKey ? "Remove Primary Key" : "Set as Primary Key"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onToggleIndex}>
            <List className={`mr-2 h-4 w-4 ${isIndexed ? "text-blue-500" : ""}`} />
            <span>{isIndexed ? "Remove Index" : "Create Index"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {onToggleNotNull && (
            <DropdownMenuItem onClick={onToggleNotNull}>
              <AlertCircle className={`mr-2 h-4 w-4 ${isNotNull ? "text-red-500" : ""}`} />
              <span>{isNotNull ? "Remove NOT NULL" : "Add NOT NULL"}</span>
            </DropdownMenuItem>
          )}

          {onToggleUnique && (
            <DropdownMenuItem onClick={onToggleUnique}>
              <Lock className={`mr-2 h-4 w-4 ${isUnique ? "text-purple-500" : ""}`} />
              <span>{isUnique ? "Remove UNIQUE" : "Add UNIQUE"}</span>
            </DropdownMenuItem>
          )}

          {onToggleAutoIncrement && (
            <DropdownMenuItem onClick={onToggleAutoIncrement}>
              <Hash className={`mr-2 h-4 w-4 ${isAutoIncrement ? "text-green-500" : ""}`} />
              <span>{isAutoIncrement ? "Remove AUTO INCREMENT" : "Add AUTO INCREMENT"}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onDelete} className="text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Column</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

