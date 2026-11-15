import HeroSection from "@/components/Main/views/1-hero/hero-section"
// import UserJourneyMap from "@/components/Main/views/2-stats/user-journey-map"
import StatsSection from "@/components/Main/views/2-stats/stats-section"
import GlobalAccessCard from "@/components/Main/views/2-stats/global-access-card"
import FiatCurrencyRates from "@/components/Main/views/3-fiat-currency/fiat-currency-rates"
import MarketOverview from "@/components/Main/views/4-market-overview/market-overview"
import PortfolioBuilder from "@/components/Main/views/5-portfolio/portfolio-builder"
import TokenPriceTicker from "@/components/Main/views/6-token-price/token-price-ticker"
import SpotTradingBanner from "@/components/Main/views/7-spot-trading/spot-trading-banner"
import ProductsSection from "@/components/Main/views/8-products/products-section"
import PartnershipSection from "@/components/Main/views/9-partnership/partnership-section"
import MobileAccessSection from "@/components/Main/views/10-mobile-access/mobile-access-section"
import CommunitySection from "@/components/Main/views/11-community/community-section"
import PartnersSection from "@/components/Main/views/12-partners/partners-section"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"

export default function Container() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        {/* <UserJourneyMap /> */}
        <StatsSection />
        <GlobalAccessCard />
        <FiatCurrencyRates />
        <MarketOverview />
        <PortfolioBuilder />
        <TokenPriceTicker />
        <SpotTradingBanner />
        <ProductsSection />
        <PartnershipSection />
        <MobileAccessSection />
        <CommunitySection />
        <PartnersSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
