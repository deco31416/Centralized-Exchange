// P2P canonical route: /markets/p2p. Do not reintroduce /p2p as the primary route.
import { NavigationProvider } from "@/components/p2p/navigation-provider"
import P2PContainer from "@/components/p2p/container"

export default function P2PPage() {
  return (
    <NavigationProvider>
      <P2PContainer />
    </NavigationProvider>
  )
}
