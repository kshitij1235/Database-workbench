import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { ExportDropdown } from "./exportOptionDropDown";

export function WorkbenchHeader({ onExportDbml, onExportSql }) {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <a className="text-2xl font-bold dark:text-white" href="/Database-workbench">
        Workbench
      </a>
      <div className="space-x-2 flex items-center">
        <ExportDropdown onExportDbml={onExportDbml} onExportSql={onExportSql} />
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
}
