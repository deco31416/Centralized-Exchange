"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!Array.isArray(items)) return null;

  return (
    <div className={cn("-mt-2 mb-10 flex justify-center md:-mt-4", className)}>
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-5 py-2.5 text-sm shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none">
        {items
          .filter((item): item is BreadcrumbItem => !!item && typeof item.label === "string")
          .map((item, index) => {
            const isLink = typeof item.href === "string" && !item.active;
            const key = `${item.label}-${index}`;

            return (
              <div key={key} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                {isLink ? (
                  <Link
                    href={item.href || "#"}
                    className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={item.active ? "font-bold text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
