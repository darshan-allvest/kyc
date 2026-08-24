'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/common/Card';
import Button from '@/components/common/button/Button';

export default function CommonModal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-2xl',
  contentClassName = '',
  cardClassName = '',
  bodyClassName = '',
  hideClose = false,
  noHeader = false,
  preventClose = false,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !preventClose) onClose();
      }}
    >
      <DialogContent
        ariaTitle={title ?? 'Modal'}
        hideClose
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={preventClose ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={preventClose ? (e) => e.preventDefault() : undefined}
        className={cn(
          'overflow-visible border-0 bg-transparent p-0 font-inter shadow-none',
          'left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
          'sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2',
          maxWidth,
          contentClassName
        )}
      >
        <Card
          bg="gradient"
          rounded="2xl"
          padding="none"
          className={cn(
            'flex max-h-[90vh] flex-col bg-homepage-buyModal',
            cardClassName
          )}
        >
          {!noHeader && (
            <DialogHeader className="flex flex-shrink-0 flex-row items-center justify-between gap-2 border-homepage-borderColor px-4 py-3 ">
              <DialogTitle className="min-w-0 flex-1 break-words text-base font-bold sm:text-lg">
                {title ?? ''}
              </DialogTitle>
              {!hideClose && (
                <Button
                  onClick={onClose}
                  aria-label="Close dialog"
                  variant="ghost"
                  size="xs"
                  className="size-8 flex-shrink-0 border-transparent p-0 text-current hover:bg-white/10 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <X className="size-4" />
                </Button>
              )}
            </DialogHeader>
          )}
          {children != null && (
            <div
              className={cn(
                'min-h-0 flex-1 overflow-y-auto px-4 pb-4',
                noHeader && 'pt-4',
                bodyClassName
              )}
            >
              {children}
            </div>
          )}
          {footer && (
            <div className="flex-shrink-0 px-4 py-4 sm:px-6">{footer}</div>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
}
