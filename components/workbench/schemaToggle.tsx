"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Database } from "lucide-react"

interface SchemaToggleProps {
  isSchemaOpen: boolean
  onToggle: () => void
}

export function SchemaToggle({ isSchemaOpen, onToggle }: SchemaToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={`absolute top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow-md ${
        isSchemaOpen ? "left-[19.5rem]" : "left-4"
      } transition-all duration-300 bg-white dark:bg-gray-800`}
      onClick={onToggle}
    >
      {isSchemaOpen ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <div className="flex items-center">
          <Database className="h-4 w-4 mr-1" />
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </Button>
  )
}

