import Hero from '@/components/landing/Hero';
import ValueProps from '@/components/landing/ValueProps';
import HowItWorks from '@/components/landing/HowItWorks';
import Ecosystem from '@/components/landing/Ecosystem';
import Tokenomics from '@/components/landing/Tokenomics';
import Team from '@/components/landing/Team';
import Testimonials from '@/components/landing/Testimonials';
import Roadmap from '@/components/landing/Roadmap';
import Partners from '@/components/landing/Partners';
import RoadmapCTA from '@/components/landing/RoadmapCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProps />
      <HowItWorks />
      <Ecosystem />
      <Tokenomics />
      {/* <Team /> */}
      <Roadmap />
      <Partners />
      <RoadmapCTA />
    </>
  );
}