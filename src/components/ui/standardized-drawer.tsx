import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * StandardizedDrawer - A consistent right drawer component for the entire application
 * 
 * Features:
 * - Fixed header with title and close button (with bottom border)
 * - Scrollable body content
 * - Fixed footer with action buttons (with top border)
 * - Smooth slide-in animation from right
 * - Consistent width, shadow, and border radius
 */

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

export interface StandardizedDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Width class - defaults to "sm:max-w-xl" */
  width?: string;
  /** Show default Cancel/Submit buttons in footer */
  showDefaultFooter?: boolean;
  /** Cancel button text - defaults to "Cancel" */
  cancelText?: string;
  /** Submit button text - defaults to "Save" */
  submitText?: string;
  /** Submit button click handler */
  onSubmit?: () => void;
  /** Cancel button click handler - defaults to closing the drawer */
  onCancel?: () => void;
  /** Whether the submit button is disabled */
  submitDisabled?: boolean;
  /** Whether submit is loading */
  isSubmitting?: boolean;
  /** Additional className for the drawer content */
  className?: string;
}

export function StandardizedDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = "sm:max-w-xl",
  showDefaultFooter = true,
  cancelText = "Cancel",
  submitText = "Save",
  onSubmit,
  onCancel,
  submitDisabled = false,
  isSubmitting = false,
  className,
}: StandardizedDrawerProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DrawerOverlay />
        <DialogPrimitive.Content
          className={cn(
            // Base styles
            "fixed z-50 bg-background shadow-lg",
            // Position - right side
            "inset-y-0 right-0 h-full border-l border-input",
            // Animation
            "transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:duration-300 data-[state=open]:duration-500",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            // Layout - flex column for fixed header/footer
            "flex flex-col overflow-hidden",
            // Width
            "w-full",
            width,
            className
          )}
        >
          {/* Fixed Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-input bg-background">
            <div className="flex flex-col gap-1">
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-sm text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {/* Fixed Footer */}
          {(footer || showDefaultFooter) && (
            <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-input bg-background">
              {footer || (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitDisabled || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      submitText
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * DrawerHeader - Standalone fixed header component for custom drawer implementations
 */
export const DrawerHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-shrink-0 px-6 py-4 border-b border-input bg-background",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
DrawerHeader.displayName = "DrawerHeader";

/**
 * DrawerBody - Scrollable body component for custom drawer implementations
 */
export const DrawerBody = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex-1 overflow-y-auto px-6 py-4", className)}
    {...props}
  >
    {children}
  </div>
);
DrawerBody.displayName = "DrawerBody";

/**
 * DrawerFooter - Fixed footer component for custom drawer implementations
 */
export const DrawerFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-input bg-background",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
DrawerFooter.displayName = "DrawerFooter";

export default StandardizedDrawer;
