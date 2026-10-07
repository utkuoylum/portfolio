import Background from '@/components/Background';
import Contact from '@/components/Contact';
import Experience from '@/components/Experience';
import Hero from '@/components/Hero';
import Instrumentation from '@/components/Instrumentation';
import Profile from '@/components/Profile';
import SiteHeader from '@/components/SiteHeader';
import Toolkit from '@/components/Toolkit';
import Work from '@/components/Work';
import { jsonLd } from '@/lib/content';

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Profile />
        <Work />
        <Experience />
        <Toolkit />
        <Background />
        <Contact />
      </main>
      <Instrumentation />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
