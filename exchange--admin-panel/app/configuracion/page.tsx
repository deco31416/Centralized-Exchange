import { AdminDomainPage } from "@/components/admin-domain-page"
import { adminDomains } from "@/lib/admin-product-registry"

export default function ConfiguracionPage() {
  return <AdminDomainPage domain={adminDomains.configuracion} />
}
