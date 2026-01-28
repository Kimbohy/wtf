import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./theme-provider";
import { TooltipProvider } from "./ui/tooltip";
import { Toaster } from "./ui/sonner";

export function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="wtf-ui-theme">
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
