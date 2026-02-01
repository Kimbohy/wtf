import type { ReactNode } from "react";
import { Separator } from "../ui/separator";
import { ThemeToggle } from "../theme-toggle";

interface PageHeaderProps {
  leftContent: ReactNode;
  rightContent?: ReactNode;
}

export function PageHeader({ leftContent, rightContent }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {leftContent}
        <div className="flex-1" />
        <div className="flex h-full items-center gap-2">
          <ThemeToggle />
          {rightContent && (
            <>
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block relative top-0"
              />
              {rightContent}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
