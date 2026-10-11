export const metadata = { title: "Offline", robots: { index: false } };
export default function Offline() {
  return (
    <div className="container-wide py-32 text-center">
      <p className="eyebrow mb-3">No connection</p>
      <h1 className="display text-5xl md:text-7xl">You're offline</h1>
      <p className="mx-auto mt-5 max-w-md text-sm text-muted">Check your internet connection and try again. Pages you've already visited may still open.</p>
    </div>
  );
}
