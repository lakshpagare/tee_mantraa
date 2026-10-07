"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 300 }}>Something went wrong</h1>
          <p style={{ color: "#6b6b6b" }}>Please refresh the page.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "12px 24px", background: "#111", color: "#fff", border: 0 }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
