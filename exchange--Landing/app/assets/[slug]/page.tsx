import { notFound } from "next/navigation"

import { AssetDetailPage } from "@/components/assets/asset-detail-page"
import { catalogAssets, getAssetBySlug } from "@/components/assets/assets-data"

type AssetSlugPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return catalogAssets.map((asset) => ({ slug: asset.slug }))
}

export async function generateMetadata({ params }: AssetSlugPageProps) {
  const { slug } = await params
  const asset = getAssetBySlug(slug)
  if (!asset) {
    return {
      title: "Asset no encontrado | deco-exchange",
    }
  }

  return {
    title: `${asset.seoTitle} | deco-exchange`,
    description: asset.seoDescription,
    alternates: {
      canonical: `/assets/${asset.slug}`,
    },
    openGraph: {
      title: asset.seoTitle,
      description: asset.seoDescription,
      type: "website",
      url: `/assets/${asset.slug}`,
    },
  }
}

export default async function AssetSlugPage({ params }: AssetSlugPageProps) {
  const { slug } = await params
  const asset = getAssetBySlug(slug)
  if (!asset) notFound()

  return <AssetDetailPage asset={asset} />
}
