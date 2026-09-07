import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HENRY IX // STUDIO WORKSPACE',
  description: 'Executive DJ Command & Broadcast Studio',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="studio-root min-h-screen bg-[#0c0d10] text-zinc-100 antialiased selection:bg-[#E53558]/30 selection:text-white">
      {children}
    </div>
  );
}