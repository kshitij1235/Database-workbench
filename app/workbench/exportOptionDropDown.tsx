import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

interface ExportDropdownProps {
  onExportDbml: () => void;
  onExportSql: () => void;
}

export function ExportDropdown({ onExportDbml, onExportSql }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onExportDbml}>Export as DBML</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onExportSql}>Export as SQL</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
