import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { ImagePlus, Trash2, Image as ImageIcon } from "lucide-react";

interface ProjectImagesUploadProps {
  images: string[];
  onUpload: (files: FileList | null) => Promise<void>;
  onRemove: (index: number) => void;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function ProjectImagesUpload({
  images,
  onUpload,
  onRemove,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: ProjectImagesUploadProps) {
  const imagesInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="md:col-span-6 lg:col-span-3">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm">Project Images</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onUpload(e.target.files)}
          className="hidden"
        />

        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => imagesInputRef.current?.click()}
          className={cn(
            "w-full h-20 rounded-md border-2 border-dashed cursor-pointer transition-colors",
            "flex items-center justify-center gap-2 text-muted-foreground",
            "hover:border-primary/50 hover:bg-muted/30",
            dragActive && "border-primary bg-primary/5",
          )}
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-xs font-medium">Add images</span>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-video rounded-md overflow-hidden border bg-muted/30"
              >
                <img
                  src={image}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            No images added
          </div>
        )}
      </CardContent>
    </Card>
  );
}
