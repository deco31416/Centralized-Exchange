import CryptoWallet from "@/components/common/mockup-wallet/components/crypto-wallet"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-950">
      <h1 className="text-2xl font-bold text-white mb-8">deco-exchange Mobile Wallet</h1>
      <CryptoWallet />
    </main>
  )
}
