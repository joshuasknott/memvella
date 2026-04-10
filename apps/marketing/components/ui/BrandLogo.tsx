export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width="36"
        height="22"
        viewBox="0 0 40 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M11.5 19.5C6.80558 19.5 3 15.6944 3 11 3 6.30558 6.80558 2.5 11.5 2.5C15.5 2.5 18 5 20 8C22 11 24.5 19.5 28.5 19.5C33.1944 19.5 37 15.6944 37 11C37 6.30558 33.1944 2.5 28.5 2.5C24.5 2.5 22 5 20 8C18 11 15.5 19.5 11.5 19.5Z"
          stroke="url(#logoGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="logoGradient" x1="3" y1="11" x2="37" y2="11" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1D4ED8" />
            <stop offset="1" stopColor="#9333EA" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-headline font-extrabold text-xl tracking-tight text-slate-900">
        Memvella
      </span>
    </div>
  );
}
