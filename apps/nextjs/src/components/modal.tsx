"use client";

import { Drawer } from "vaul";

import { Z_INDEX } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { Dialog, DialogContent } from "@saasfly/ui/dialog";

import useMediaQuery from "~/hooks/use-media-query";

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  showModal: boolean;
  setShowModal: (open?: boolean) => void;
}

export function Modal({
  children,
  className,
  showModal,
  setShowModal,
}: ModalProps) {
  const { isMobile } = useMediaQuery();

  if (isMobile) {
    return (
      <div className="relative">
        <Drawer.Root open={showModal} onClose={setShowModal}>
          <Drawer.Overlay className={`fixed inset-0 ${Z_INDEX.overlay} bg-background/80 backdrop-blur-sm`} />
          <Drawer.Portal>
            <Drawer.Content
              className={cn(
                `fixed inset-x-0 bottom-0 ${Z_INDEX.modal} mt-24 overflow-hidden rounded-t-2xl border bg-background`,
                className,
              )}
              aria-label="Modal content"
            >
              <div
                className={`sticky top-0 ${Z_INDEX.content} flex w-full items-center justify-center bg-inherit`}
                aria-hidden="true"
              >
                <div className="my-3 h-1.5 w-16 rounded-full bg-muted-foreground/20" />
              </div>
              {children}
            </Drawer.Content>
            <Drawer.Overlay />
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  }
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent
        className="overflow-hidden border-neutral-200 p-0 dark:border-neutral-800 md:max-w-md md:rounded-2xl md:border"
        aria-label="Modal content"
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
