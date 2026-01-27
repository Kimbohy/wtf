import { Dialog, DialogContent, DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryDialogProps {
  images: string[];
  selectedIndex: number | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function ImageGalleryDialog({
  images,
  selectedIndex,
  onClose,
  onPrevious,
  onNext,
}: ImageGalleryDialogProps) {
  return (
    <Dialog
      open={selectedIndex !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[80vw]! w-[80vw]! max-h-[95vh]! h-[95vh]! p-0 bg-white/80 border-0! overflow-hidden dark:bg-black/50"
      >
        <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-white/90 backdrop-blur-sm p-2.5 hover:bg-white transition-colors shadow-lg dark:bg-white/80 dark:hover:bg-white">
          <X className="h-5 w-5 text-black" />
        </DialogClose>

        {images.length > 1 && selectedIndex !== null && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white transition-all h-14 w-14 shadow-lg dark:hover:bg-white/80"
            >
              <ChevronLeft className="h-7 w-7 text-black" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white transition-all h-14 w-14 shadow-lg dark:hover:bg-white/80"
            >
              <ChevronRight className="h-7 w-7 text-black" />
            </Button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full text-base font-medium text-black shadow-lg">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        )}

        {selectedIndex !== null && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={images[selectedIndex]}
              alt={`Screenshot ${selectedIndex + 1}`}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
