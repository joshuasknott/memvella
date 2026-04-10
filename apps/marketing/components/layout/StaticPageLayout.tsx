import { Header } from "./Header";
import { Footer } from "./Footer";

interface StaticPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function StaticPageLayout({ title, children }: StaticPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      <Header />

      {/* Page title band */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Prose body */}
      <main className="flex-1 px-6 py-16 md:px-8 md:py-20">
        <article className="prose prose-slate prose-lg mx-auto max-w-3xl prose-headings:font-headline prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-purple-800 prose-a:no-underline hover:prose-a:underline">
          {children}
        </article>
      </main>

      <Footer />
    </div>
  );
}
