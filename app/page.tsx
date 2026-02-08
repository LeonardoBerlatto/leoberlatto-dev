import Terminal from '@/components/Terminal';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leonardo Berlatto - Portfolio',
  description: 'Leonardo Berlatto\'s portfolio site',
};

export default function Home() {
  return (
    <main className="h-screen w-screen p-0 md:p-4 font-mono">
      <Terminal />
    </main>
  );
}
