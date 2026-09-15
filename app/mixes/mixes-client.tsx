'use client';

import MixPortfolio from '@/components/MixPortfolio';
import { useAudioStore } from '@/store/audioStore';
import { cn } from '@/lib/utils';

export default function MixesClient() {
  const isCDJView = useAudioStore(s => s.isCDJView);
  return (
    <div className={cn(
      "fixed inset-0 w-full h-full flex flex-col text-white transition-all duration-300 selection:bg-primary/30 selection:text-primary font-mono select-none overflow-hidden bg-transparent",
      isCDJView ? "pt-0 pb-0 px-0" : "pt-12 md:pt-24 pb-2 px-2 md:px-3"
    )}>
      <MixPortfolio isDepth={true} />
    </div>
  );
}
