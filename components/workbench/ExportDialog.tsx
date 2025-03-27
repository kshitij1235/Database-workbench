"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  sqlContent: string
  dbmlContent: string
  onExport: (type: "sql" | "dbml") => void
}

export function ExportDialog({ isOpen, onClose, sqlContent, dbmlContent, onExport }: ExportDialogProps) {
  const [activeTab, setActiveTab] = useState<"sql" | "dbml">("sql")
  const { toast } = useToast()

  const handleCopy = () => {
    const content = activeTab === "sql" ? sqlContent : dbmlContent
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: `${activeTab.toUpperCase()} content has been copied to your clipboard.`,
    })
  }

  const handleExport = () => {
    onExport(activeTab)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Database Schema</DialogTitle>
          <DialogDescription>
            Preview your schema before exporting. You can copy the content or download it as a file.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "sql" | "dbml")}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sql">SQL</TabsTrigger>
            <TabsTrigger value="dbml">DBML</TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col mt-4 border rounded-md">
            <TabsContent value="sql" className="flex-1 flex flex-col m-0">
              <ScrollArea className="flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 rounded-md">
                <pre>{sqlContent}</pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="dbml" className="flex-1 flex flex-col m-0">
              <ScrollArea className="flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 rounded-md">
                <pre>{dbmlContent}</pre>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex justify-between items-center sm:justify-between mt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Download {activeTab.toUpperCase()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

