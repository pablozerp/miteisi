import { notFound } from 'next/navigation';
import { getLocalDoc } from '@/lib/localDocs';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { slug: 'python-introduccion' },
    { slug: 'javascript-introduccion' },
    { slug: 'cpp-introduccion' },
    { slug: 'java-introduccion' },
    { slug: 'go-introduccion' },
    { slug: 'rust-introduccion' },
  ];
}

export default function LocalDocPage({ params }) {
  const doc = getLocalDoc(params.slug);
  if (!doc) return notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-slate-900/95 border border-slate-700 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-4">{doc.title}</h1>
        <div
          className="prose prose-invert max-w-none text-slate-200"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </div>
    </main>
  );
}
