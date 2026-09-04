import CircleBottomNav from "@/components/CircleBottomNav";
import CircleHeader from "@/components/CircleHeader";
import CircleProfileBootstrap from "@/components/CircleProfileBootstrap";

export default function CircleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="circle-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <CircleProfileBootstrap />
      <CircleBottomNav />
      <div className="circle-content">
        <CircleHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
