import React from 'react';
import { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import Link from 'next/link';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Terms of Service & Usage Agreement | HENRY IX',
  description: 'Official Terms of Service, Studio Usage Agreement, and Third-Party API Policies for HENRY IX.',
};

export default function TermsPage() {
  return (
    <PageShell>
      <div className="w-full max-w-4xl mx-auto py-12 px-4 md:px-8 font-mono text-zinc-300">
        
        {/* Header */}
        <div className="border-b border-zinc-900 pb-8 mb-10">
          <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-widest">
            <span>●</span> UK LEGAL & SERVICE USAGE TERMS
          </div>
          <h1 className="text-3xl md:text-5xl font-avathe font-black tracking-widest text-primary uppercase mb-4 glitch" data-text="TERMS OF SERVICE">
            TERMS OF SERVICE
          </h1>
          <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 uppercase tracking-widest">
            <span>EFFECTIVE DATE: SEPTEMBER 2026</span>
            <span>•</span>
            <span>JURISDICTION: UNITED KINGDOM</span>
            <span>•</span>
            <span>SERVICE: HENRYIX.COM & BACKSTAGE STUDIO</span>
          </div>
        </div>

        {/* Legal Contents */}
        <div className="flex flex-col gap-10 leading-relaxed text-sm text-zinc-400 font-sans">
          
          {/* Section 1: Acceptance */}
          <section className="bg-black border border-zinc-900 rounded-none p-6 md:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider text-primary border-b border-zinc-900 pb-2">
              01 // ACCEPTANCE OF TERMS
            </h2>
            <p>
              By accessing and using <strong className="text-zinc-200">henryix.com</strong> and its private backstage operations environment (<strong className="text-zinc-200">HENRY IX Studio</strong>), you agree to be legally bound by these Terms of Service and all applicable laws and regulations under the jurisdiction of England and Wales.
            </p>
            <p>
              If you do not agree with any of these terms, you are prohibited from using or accessing this site and its integrated services.
            </p>
          </section>

          {/* Section 2: Studio & Third-Party APIs */}
          <section className="bg-black border border-zinc-900 rounded-none p-6 md:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider text-primary border-b border-zinc-900 pb-2">
              02 // STUDIO WORKSTATION & THIRD-PARTY PLATFORM INTEGRATIONS
            </h2>
            <p>
              The HENRY IX Studio integrates with approved third-party developer APIs to manage creative assets, media moodboards, and promotional workflows:
            </p>
            <div className="flex flex-col gap-3 font-mono text-xs text-zinc-300">
              <div className="border-l-2 border-red-500 pl-3 py-1">
                <strong className="text-white block">Pinterest Developer API:</strong>
                <span className="text-zinc-400 font-sans text-xs">Used strictly by authorized Studio operators to view, curate, and reference personal visual moodboards, stage aesthetics, and artwork designs. The Studio complies with the Pinterest Developer Terms of Service and Community Guidelines. No content retrieved via the Pinterest API is redistributed or sold.</span>
              </div>
              <div className="border-l-2 border-emerald-400 pl-3 py-1">
                <strong className="text-white block">SoundCloud & Spotify APIs:</strong>
                <span className="text-zinc-400 font-sans text-xs">Used for embedding interactive track widgets, previewing set selections, and displaying streaming links in accordance with respective platform developer terms.</span>
              </div>
              <div className="border-l-2 border-cyan-400 pl-3 py-1">
                <strong className="text-white block">Cloudflare R2 & Media Storage:</strong>
                <span className="text-zinc-400 font-sans text-xs">Used for secure hosting and edge delivery of audio recordings, mix waveforms, and original brand imagery.</span>
              </div>
            </div>
          </section>

          {/* Section 3: Intellectual Property */}
          <section className="bg-black border border-zinc-900 rounded-none p-6 md:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider text-primary border-b border-zinc-900 pb-2">
              03 // INTELLECTUAL PROPERTY RIGHTS
            </h2>
            <p>
              All original musical works, DJ mix recordings, custom typography, brand graphics, visual dither artwork, and software interfaces appearing on this site are the exclusive intellectual property of <strong className="text-zinc-200">HENRY IX</strong>, unless credited otherwise.
            </p>
            <p className="font-mono text-xs text-zinc-300">
              Unauthorized reproduction, re-recording, commercial broadcasting, or automated scraping of content without prior written permission is strictly prohibited.
            </p>
          </section>

          {/* Section 4: Acceptable Use */}
          <section className="bg-black border border-zinc-900 rounded-none p-6 md:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider text-primary border-b border-zinc-900 pb-2">
              04 // ACCEPTABLE USE POLICY
            </h2>
            <p>When using this website, you agree not to:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 font-mono text-xs text-zinc-300">
              <li>Attempt to gain unauthorized access to private Studio routes, admin consoles, or backend API endpoints.</li>
              <li>Circumvent or tamper with audio player security, DRM, or Cloudflare edge protections.</li>
              <li>Inject malicious scripts, automated bot scrapers, or flood requests that impact site latency or service availability.</li>
              <li>Misrepresent affiliation with HENRY IX or transmit fraudulent booking inquiries.</li>
            </ul>
          </section>

          {/* Section 5: Limitation of Liability */}
          <section className="bg-black border border-zinc-900 rounded-none p-6 md:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider text-primary border-b border-zinc-900 pb-2">
              05 // LIMITATION OF LIABILITY & DISCLAIMERS
            </h2>
            <p>
              This website and its digital tools are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. HENRY IX will not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use this site, external third-party API interruptions, or event ticketing schedule changes.
            </p>
          </section>

          {/* Section 6: Governing Law */}
          <section className="bg-black border border-zinc-900 rounded-none p-6 md:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider text-primary border-b border-zinc-900 pb-2">
              06 // GOVERNING LAW & JURISDICTION
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of <strong className="text-zinc-200">England and Wales</strong>. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
            <div className="bg-black border border-zinc-900 rounded-none p-4 font-mono text-xs text-zinc-400 flex flex-col gap-1">
              <span className="text-zinc-500 uppercase tracking-widest font-bold">Legal Contact</span>
              <span className="text-zinc-200">Email: henryixdj@gmail.com</span>
              <span className="text-zinc-500">Location: London, United Kingdom</span>
            </div>
          </section>

        </div>

        {/* Back navigation footer */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex justify-between items-center text-xs">
          <Link href="/" className="px-4 py-2 bg-black hover:bg-zinc-900 border border-zinc-900 rounded-none text-zinc-400 hover:text-zinc-200 transition-colors uppercase font-mono tracking-widest font-bold">
            ← RETURN TO ARCHIVE
          </Link>
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
            SYS_REF // TERMS_v1.0
          </span>
        </div>

      </div>
    </PageShell>
  );
}
