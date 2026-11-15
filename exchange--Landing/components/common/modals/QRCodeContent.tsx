"use client";

import Image from "next/image";

interface QRCodeContentProps {
  qrText?: string;
  qrImageSrc?: string;
  qrImageDarkSrc?: string;
  size?: number;
}

export function QRCodeContent({
  qrText = "Descargar aplicación",
  qrImageSrc = "/images/utils/qr-code.png",
  qrImageDarkSrc = "/images/utils/qr-code-white.png",
  size = 157,
}: QRCodeContentProps) {
  return (
    <div className="max-h-max w-[238px] transform-none overflow-hidden rounded-2xl border border-border bg-popover p-4 text-center text-popover-foreground opacity-100 shadow-[0px_8px_43px_0px_rgba(0,0,0,0.13)]">
      <p className="text-md font-semibold mb-2">{qrText}</p>
      <div className="rounded-2xl border border-border bg-background p-6">
        <Image
          src={qrImageSrc}
          alt="QR Code"
          width={size}
          height={size}
          className="mx-auto rounded dark:hidden"
        />
        <Image
          src={qrImageDarkSrc}
          alt="QR Code"
          width={size}
          height={size}
          className="mx-auto hidden rounded dark:block"
        />
      </div>
</div>


  );
}
