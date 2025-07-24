import KasServer from './components/kas-server';

// Atur agar selalu mengambil data terbaru dari database
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function KasPage() {
  return <KasServer />;
} 