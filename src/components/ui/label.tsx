"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Label({
  className,
  htmlFor,
  ...props
}: React.ComponentProps<"label"> & { htmlFor: string }) {
  return (
    <label
      data-slot="label"
      htmlFor={htmlFor}
      className={cn("flex items-center gap-2 text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

export { Label };
