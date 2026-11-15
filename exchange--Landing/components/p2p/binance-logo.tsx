import type React from "react"
export function BinanceLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 0L5.496 6.504L8.664 9.672L12 6.336L15.336 9.672L18.504 6.504L12 0Z"
        fill="currentColor"
        className="text-primary"
      />
      <path d="M12 12.336L8.664 9L5.496 12.168L8.664 15.336L12 12.336Z" fill="currentColor" className="text-primary" />
      <path
        d="M12 12.336L15.336 9L18.504 12.168L15.336 15.336L12 12.336Z"
        fill="currentColor"
        className="text-primary"
      />
      <path
        d="M12 24L18.504 17.496L15.336 14.328L12 17.664L8.664 14.328L5.496 17.496L12 24Z"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  )
}
