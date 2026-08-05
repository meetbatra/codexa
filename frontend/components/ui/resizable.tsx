"use client"

import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  direction,
  orientation,
  autoSaveId,
  id,
  ...props
}: ResizablePrimitive.GroupProps & {
  direction?: "horizontal" | "vertical"
  orientation?: "horizontal" | "vertical"
  autoSaveId?: string
}) {
  const groupOrientation = orientation || direction || "horizontal"
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      id={id || autoSaveId}
      orientation={groupOrientation}
      className={cn(
        "flex h-full w-full min-w-0 min-h-0",
        groupOrientation === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  className,
  ...props
}: ResizablePrimitive.PanelProps) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("min-w-0 min-h-0", className)}
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-border ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=vertical]:w-px aria-[orientation=vertical]:h-full",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
