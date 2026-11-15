"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface InfoCardProps {
  title: string;
  subtitle?: string;
  company?: string;
  companyInfo?: string;
  description?: string;
  link?: {
    text: string;
    href: string;
  };
}

export default function InfoCard({ title, subtitle, company, companyInfo, description, link }: InfoCardProps) {
  return (
    <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-6 shadow-[0_20px_55px_rgba(15,23,42,0.10)] dark:bg-white/[0.035] dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {subtitle && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6c02]">{subtitle}</p>}
          <h3 className="mb-2 text-xl font-black text-foreground">{title}</h3>
          {company && <p className="text-sm font-semibold text-foreground">{company}</p>}
          {companyInfo && <p className="text-sm text-muted-foreground">{companyInfo}</p>}
          {description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>}

          {link?.href && (
            <Link
              href={link.href}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ff6c02] px-5 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              {link.text}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
