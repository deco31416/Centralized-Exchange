"use client";

import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";

interface DownloadCardProps {
  title: string;
  description: string;
  href?: string;
  fileSize?: string;
  fileType?: string;
}

export default function DownloadCard({ title, description, href = "#", fileSize, fileType }: DownloadCardProps) {

  return (
    <Link
      href={href}
      className="group block rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-5 shadow-[0_20px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-white/[0.035] dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/[0.055]"
      prefetch={false}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-background text-[#ff6c02]">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-black leading-tight text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            {(fileSize || fileType) && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {[fileType, fileSize].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}
