import { notFound } from "next/navigation"

import { getPaymentMethodBySlug, paymentMethods } from "@/components/assets/assets-data"
import { PaymentMethodDetailPage } from "@/components/assets/payment-method-detail-page"

type PaymentMethodSlugPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return paymentMethods.map((method) => ({ slug: method.slug }))
}

export async function generateMetadata({ params }: PaymentMethodSlugPageProps) {
  const { slug } = await params
  const method = getPaymentMethodBySlug(slug)
  if (!method) {
    return {
      title: "Metodo no encontrado | deco-exchange",
    }
  }

  return {
    title: `${method.seoTitle} | deco-exchange`,
    description: method.seoDescription,
    alternates: {
      canonical: `/assets/payment-methods/${method.slug}`,
    },
    openGraph: {
      title: method.seoTitle,
      description: method.seoDescription,
      type: "website",
      url: `/assets/payment-methods/${method.slug}`,
    },
  }
}

export default async function PaymentMethodSlugPage({ params }: PaymentMethodSlugPageProps) {
  const { slug } = await params
  const method = getPaymentMethodBySlug(slug)
  if (!method) notFound()

  return <PaymentMethodDetailPage method={method} />
}
