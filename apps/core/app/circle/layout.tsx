import CircleBottomNav from "@/components/CircleBottomNav";
import CircleHeader from "@/components/CircleHeader";
import CircleProfileBootstrap from "@/components/CircleProfileBootstrap";
import ConnectionNotice from "@/components/ConnectionNotice";

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
          <ConnectionNotice />
          {children}
        </main>
      </div>
    </div>
  );
}
