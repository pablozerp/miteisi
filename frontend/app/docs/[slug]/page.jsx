import { notFound } from 'next/navigation';
import { getLocalDoc } from '@/lib/localDocs';
import Link from 'next/link';

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
    <main className="min-h-screen bg-[#0b1326] p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="bg-orb w-[600px] h-[600px] bg-blue-600/10 top-[-200px] left-[-200px]" />
      
      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>

        {/* Document Content */}
        <div className="glass-card p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{doc.title}</h1>
              <p className="text-slate-400 mt-2 font-medium">{doc.summary}</p>
            </div>
          </div>

          {/* Prose styling for injected HTML */}
          <div
            className="prose prose-invert prose-blue max-w-none 
                       prose-headings:font-bold prose-headings:tracking-tight 
                       prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                       prose-p:text-slate-300 prose-p:leading-relaxed
                       prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                       prose-pre:bg-[#0b1326] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:shadow-inner
                       prose-code:text-orange-300 prose-code:font-mono prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                       prose-li:text-slate-300 prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </div>
      </div>
    </main>
  );
}
