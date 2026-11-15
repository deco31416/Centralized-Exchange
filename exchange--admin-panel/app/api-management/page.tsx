import { AdminDomainPage } from "@/components/admin-domain-page"
import { adminDomains } from "@/lib/admin-product-registry"

export default function ApiManagementPage() {
  return <AdminDomainPage domain={adminDomains.apiManagement} />
}
