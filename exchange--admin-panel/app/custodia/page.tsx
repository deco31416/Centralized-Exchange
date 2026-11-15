import { AdminDomainPage } from "@/components/admin-domain-page"
import { adminDomains } from "@/lib/admin-product-registry"

export default function CustodiaPage() {
  return <AdminDomainPage domain={adminDomains.custodia} />
}
