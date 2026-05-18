export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="hq-panel h-32 animate-pulse rounded-lg" key={index} />
      ))}
    </div>
  );
}
