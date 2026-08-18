import React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

export type BorderCornerStyle = "l" | "plus" | "square" | "double" | "dot";

const cornerPlacements: Array<{ className: string }> = [
  { className: "absolute -bottom-px -left-px" },
  { className: "absolute -bottom-px -right-px scale-x-[-1]" },
  { className: "absolute -top-px -left-px scale-y-[-1]" },
  { className: "absolute -top-px -right-px scale-[-1]" },
];

export const BorderButton = ({
  children,
  variant = "outline",
  corners = "l",
  className,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  variant?:
    | "outline"
    | "default"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  corners?: BorderCornerStyle;
  className?: string;
  asChild?: boolean;
} & React.ComponentProps<"button">) => {
  const corner = cornerPlacements.map((placement) => (
    <CornerArt
      key={placement.className}
      style={corners}
      className={placement.className}
    />
  ));

  return (
    <Button
      variant={variant}
      asChild={asChild}
      className={cn(
        className,
        "relative overflow-visible rounded-none px-4! shadow-none",
      )}
      {...props}
    >
      {asChild ? (
        // Radix's Slot requires exactly one child element, so the corner
        // decorations get merged INTO that element's own children instead
        // of rendered as siblings alongside it.
        React.cloneElement(
          React.Children.only(children as React.ReactElement),
          undefined,
          <>
            {(children as React.ReactElement<{ children?: React.ReactNode }>).props.children}
            {corner}
          </>,
        )
      ) : (
        <>
          {children}
          {corner}
        </>
      )}
    </Button>
  );
};

const overflowVisibleStyles: Partial<Record<BorderCornerStyle, boolean>> = {
  plus: true,
  double: true,
  dot: true,
};

const CornerArt = ({
  style,
  className,
}: {
  style: BorderCornerStyle;
  className?: string;
}) => {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      overflow={overflowVisibleStyles[style] ? "visible" : undefined}
      aria-hidden
      className={cn("pointer-events-none size-3", className)}
    >
      {cornerPaths[style]}
    </svg>
  );
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "square" as const,
};

const cornerPaths: Record<BorderCornerStyle, React.ReactNode> = {
  l: (
    <>
      <path d="M0 0V12" {...stroke} />
      <path d="M0 12H12" {...stroke} />
    </>
  ),
  plus: (
    <>
      <path d="M-6 12 H6" {...stroke} />
      <path d="M0 6 V18" {...stroke} />
    </>
  ),
  square: <rect x="0" y="8" width="4" height="4" {...stroke} />,
  double: (
    <>
      <path d="M0 0 V12" {...stroke} />
      <path d="M0 12 H12" {...stroke} />
      <path d="M-2 2 V14" {...stroke} />
      <path d="M-2 14 H10" {...stroke} />
    </>
  ),
  dot: (
    <>
      <circle cx="0" cy="12" r="1.25" fill="currentColor" />
      <path d="M-4.5 12 H0" {...stroke} />
      <path d="M0 12 V16.5" {...stroke} />
    </>
  ),
};
