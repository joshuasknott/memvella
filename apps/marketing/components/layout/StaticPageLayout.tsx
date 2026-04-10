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

      {/* Page title band — full width */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-16 mb-12">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Prose body */}
      <main className="flex-1">
        <article className="prose prose-slate lg:prose-lg max-w-3xl mx-auto py-12 px-6 pb-20 prose-headings:font-headline prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-purple-800 prose-a:no-underline hover:prose-a:underline">
          {children}
        </article>
      </main>

      <Footer />
    </div>
  );
}
