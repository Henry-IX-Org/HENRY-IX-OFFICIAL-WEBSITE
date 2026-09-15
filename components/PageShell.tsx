'use client';

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white pt-12 md:pt-24 pb-16 md:pb-20 selection:bg-primary/30 selection:text-primary">
      <div className="w-full flex flex-col justify-center">{children}</div>
    </div>
  );
}
