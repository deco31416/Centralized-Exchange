"use client";

import Image from "next/image";

export const PLACEHOLDER_IMAGE = "/mockup-wallet/placeholder-logo.svg";

export function SafeImage({
  src,
  alt,
  ...props
}: {
  src: string | null;
  alt: string;
  [key: string]: any;
}) {
  const safeSrc = src && src.trim() !== "" ? src : PLACEHOLDER_IMAGE;
  return <Image src={safeSrc || "/placeholder.svg"} alt={alt} {...props} />;
}
