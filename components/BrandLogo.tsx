export default function BrandLogo({ 
  className = "",
  standalone = false,
  animated = false
}: { 
  className?: string;
  standalone?: boolean;
  animated?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Infinity Symbol Logo */}
      <svg 
        width="40" 
        height="24" 
        viewBox="0 0 40 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${animated ? 'motion-safe:animate-[breathe_4s_ease-in-out_infinite]' : ''} ${standalone ? 'w-24 h-24 md:w-32 md:h-32' : ''}`}
      >
        <path 
          d="M11.5 19.5C6.80558 19.5 3 15.6944 3 11 3 6.30558 6.80558 2.5 11.5 2.5C15.5 2.5 18 5 20 8C22 11 24.5 19.5 28.5 19.5C33.1944 19.5 37 15.6944 37 11C37 6.30558 33.1944 2.5 28.5 2.5C24.5 2.5 22 5 20 8C18 11 15.5 19.5 11.5 19.5Z" 
          stroke="url(#memvellaGradient)" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="memvellaGradient" x1="3" y1="11" x2="37" y2="11" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1D4ED8" />
            <stop offset="1" stopColor="#9333EA" />
          </linearGradient>
        </defs>
      </svg>
      {/* Brand Text */}
      {!standalone && (
        <span className="font-headline font-extrabold text-3xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-700 to-purple-600 pb-1">
          Memvella
        </span>
      )}
    </div>
  );
}
