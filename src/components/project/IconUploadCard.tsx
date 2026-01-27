import { useRef } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { cn } from "../../lib/utils";
import { Upload, Trash2, Sun, Moon, Copy } from "lucide-react";

interface IconUploadCardProps {
  iconLight: string;
  iconDark: string;
  previewMode: "light" | "dark";
  onPreviewModeChange: (mode: "light" | "dark") => void;
  onIconUpload: (files: FileList | null) => Promise<void>;
  onIconDelete: (mode: "light" | "dark") => void;
  onCopyIcon: (fromMode: "light" | "dark") => void;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function IconUploadCard({
  iconLight,
  iconDark,
  previewMode,
  onPreviewModeChange,
  onIconUpload,
  onIconDelete,
  onCopyIcon,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: IconUploadCardProps) {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const currentIcon = previewMode === "light" ? iconLight : iconDark;
  const otherIcon = previewMode === "light" ? iconDark : iconLight;

  return (
    <Card
      className={cn(
        "md:col-span-2 lg:col-span-2 relative transition-colors",
        previewMode === "light"
          ? "bg-white text-zinc-900 border-zinc-200"
          : "bg-[#171717] text-zinc-100 border-zinc-800",
      )}
    >
      <CardContent className="p-4 space-y-3">
        <input
          ref={iconInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => onIconUpload(e.target.files)}
          className="hidden"
        />

        {currentIcon ? (
          <div className="relative group">
            <div
              className={cn(
                "aspect-square w-full rounded-lg overflow-hidden border-2 border-dashed",
                previewMode === "light" ? "border-zinc-300" : "border-zinc-700",
              )}
            >
              <img
                src={currentIcon}
                alt={`${previewMode} mode icon`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => iconInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={() => onIconDelete(previewMode)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => iconInputRef.current?.click()}
            className={cn(
              "aspect-square w-full rounded-lg border-2 border-dashed cursor-pointer transition-colors",
              "flex flex-col items-center justify-center gap-1",
              previewMode === "light"
                ? "text-zinc-500 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100"
                : "text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800",
              dragActive && "border-primary bg-primary/5",
            )}
          >
            <Upload className="h-6 w-6" />
            <span className="text-xs font-medium">Upload Icon</span>
            {otherIcon && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={cn(
                  "mt-2 h-7 text-xs",
                  previewMode === "light"
                    ? "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyIcon(previewMode === "light" ? "dark" : "light");
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Use {previewMode === "light" ? "dark" : "light"} icon
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-1 justify-end">
          <Sun
            className={cn(
              "h-4 w-4",
              previewMode === "light" ? "text-yellow-500" : "text-zinc-400",
            )}
          />
          <Switch
            defaultChecked={previewMode === "light"}
            checked={previewMode === "dark"}
            onCheckedChange={(checked) =>
              onPreviewModeChange(checked ? "dark" : "light")
            }
            className={cn(
              previewMode === "light"
                ? "data-checked:bg-zinc-800! data-unchecked:bg-zinc-300! [&>span]:bg-with! [&>span]:data-checked:bg-with!"
                : "data-checked:bg-zinc-200! data-unchecked:bg-zinc-700! [&>span]:bg-[#171717]! [&>span]:data-checked:bg-[#171717]!",
            )}
          />
          <Moon
            className={cn(
              "h-4 w-4",
              previewMode === "dark" ? "text-blue-500" : "text-zinc-400",
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
