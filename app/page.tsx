import fs from 'fs';
import path from 'path';
import Terminal from '@/components/Terminal';
import { buildContent } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leonardo Berlatto - Portfolio',
  description: 'Leonardo Berlatto\'s portfolio site',
};

function readContentFile(filename: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), 'content', filename),
    'utf-8',
  );
}

const content = buildContent({
  about: readContentFile('about.md'),
  stack: readContentFile('stack.md'),
  projects: readContentFile('projects.md'),
  social: readContentFile('social.md'),
  blog: readContentFile('blog.md'),
});

export default function Home() {
  return (
    <main className="h-screen w-screen p-0 md:p-4 font-mono">
      <Terminal content={content} />
    </main>
  );
}
