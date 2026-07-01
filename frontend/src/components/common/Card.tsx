import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

// Base Card — design doc §4.1. The image-top variant (room/hall/menu item
// cards) is composed from this in module phases by placing an <img> as the
// first child before a content div.
export function Card({ children, hoverable = false, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-md border border-neutral-200 bg-surface p-6 transition-shadow ${
        hoverable ? "hover:shadow-elevation-1 cursor-pointer" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}