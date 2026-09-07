import React from 'react';
import { Download, PlayCircle, Lock } from 'lucide-react';
import AsciiDitherGlitch from '@/components/AsciiDitherGlitch';

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let result = 0;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const charA = a.charCodeAt(i) || 0;
    const charB = b.charCodeAt(i) || 0;
    result |= (charA ^ charB);
  }
  return result === 0 && a.length === b.length;
}

export default async function PressKitPage({ params }: { params: Promise<{ key: string }> }) {
  const resolvedParams = await params;
  const expectedKey = process.env.PROMOTER_EPK_KEY || 'henryix-epk-press-2026';
  const isValid = Boolean(resolvedParams?.key && safeCompare(resolvedParams.key, expectedKey));

  if (!isValid) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="text-center">
          <Lock className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-xl">UNAUTHORIZED ACCESS</p>
          <p className="text-xs text-zinc-500 mt-2">INVALID PROMOTER KEY</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16 custom-scrollbar relative overflow-hidden">
      
      {/* Background Dither */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
         <AsciiDitherGlitch text="HENRY IX // PROMOTER EPK" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-avathe text-5xl md:text-7xl text-[var(--color-primary)] uppercase tracking-wider" style={{ textShadow: '0 0 15px var(--color-primary-glow)' }}>HENRY IX</h1>
            <p className="font-mono text-sm text-zinc-400 mt-2 tracking-[0.3em]">ELECTRONIC PRESS KIT</p>
          </div>
          <a 
            href={`/api/epk/zip?key=${encodeURIComponent(resolvedParams.key)}`}
            download="Henry_IX_Press_Kit_2026.zip"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold uppercase font-mono text-sm hover:bg-white hover:text-black transition-colors shadow-neon-glow"
          >
            <Download className="w-4 h-4" />
            Download full EPK (.zip)
          </a>
        </div>

        {/* Bio & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-mono text-lg text-white mb-4 uppercase border-b border-zinc-900 pb-2">Biography</h2>
            <p className="font-tertiary text-sm text-zinc-400 leading-relaxed">
              HENRY IX is a multidisciplinary DJ and producer blending high-energy techno, acid, and queer disco into 
              sweat-drenched, immersive club experiences. Known for precision mixing and 4-deck live sets, HENRY IX 
              transforms the dancefloor into a sanctuary of rhythm.
            </p>
            <p className="font-tertiary text-sm text-zinc-400 leading-relaxed mt-4">
              Base: London, UK<br/>
              Formats: CDJs (3/4 Decks), Vinyl<br/>
              Genres: Techno, Hard Dance, House, Queer Disco
            </p>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-900 p-6 flex flex-col items-center justify-center">
            <div className="w-full h-48 bg-zinc-900 flex items-center justify-center relative overflow-hidden bayer-dither border border-zinc-800">
               <span className="font-mono text-xs text-zinc-600">PRESS PHOTO // HIGH-RES</span>
            </div>
          </div>
        </div>

        {/* Unlisted Promoters Mixes */}
        <div>
          <h2 className="font-mono text-lg text-[var(--color-primary)] mb-6 uppercase border-b border-zinc-900 pb-2">Unlisted Promoters Previews</h2>
          <div className="flex flex-col gap-4">
            
            {[
              { title: 'PROMOTER_PREVIEW_01_LONDON.WAV', duration: '58:24' },
              { title: 'PROMOTER_PREVIEW_02_WAREHOUSE.WAV', duration: '01:14:10' }
            ].map((mix, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-4 flex items-center justify-between group hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors">
                    <PlayCircle className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors">{mix.title}</h3>
                    <p className="font-mono text-[10px] text-zinc-600 mt-1">WATERMARKED // {mix.duration}</p>
                  </div>
                </div>
                <button className="p-2 text-zinc-500 hover:text-[var(--color-primary)] transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
