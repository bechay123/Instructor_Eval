import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

const Tabs = React.memo(
  ({ value, onValueChange, className, children }: TabsProps) => {
    return (
      <div className={cn("w-full", className)}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onValueChange,
              currentValue: value,
            } as any);
          }
          return child;
        })}
      </div>
    );
  }
);

Tabs.displayName = "Tabs";

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsList = React.memo(
  ({ className, children, value, onValueChange }: TabsListProps) => (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onValueChange,
            currentValue: value,
          } as any);
        }
        return child;
      })}
    </div>
  )
);

TabsList.displayName = "TabsList";

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  currentValue?: string;
  onValueChange?: (value: string) => void;
}

const TabsTrigger = React.memo(
  ({
    value: triggerValue,
    className,
    children,
    currentValue,
    onValueChange,
  }: TabsTriggerProps) => {
    const isActive = currentValue === triggerValue;

    const handleClick = React.useCallback(() => {
      onValueChange?.(triggerValue);
    }, [onValueChange, triggerValue]);

    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive && "bg-background text-foreground shadow-sm",
          className
        )}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  currentValue?: string;
}

const TabsContent = React.memo(
  ({
    value: contentValue,
    className,
    children,
    currentValue,
  }: TabsContentProps) => {
    if (currentValue !== contentValue) return null;

    return (
      <div
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
