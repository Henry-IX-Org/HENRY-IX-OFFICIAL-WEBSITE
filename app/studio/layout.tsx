import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HENRY IX // STUDIO CONTROL',
  description: 'Mission Control & Broadcast Operations Console',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="studio-root min-h-screen bg-black text-white selection:bg-[#D8163F] selection:text-white">
      {children}
    </div>
  );
}