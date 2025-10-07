import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import AnalyticsShowcase from '@/components/landing/AnalyticsShowcase';
import Tokenomics from '@/components/landing/Tokenomics';
import Partners from '@/components/landing/Partners';
import RoadmapCTA from '@/components/landing/RoadmapCTA';
import PlatformStats from '@/components/common/PlatformStats';
import Trending from '@/components/landing/Trending';

export default function Home() {
  return (
    <>
      <Hero />
      <PlatformStats />
      <HowItWorks />
      <Features />
      <AnalyticsShowcase />
      <Trending />
      <Tokenomics />
      <Partners />
      <RoadmapCTA />
    </>
  );
}