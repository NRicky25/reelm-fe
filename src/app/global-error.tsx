"use client";

/** Last-resort error screen (when even the root layout fails). Must render its own <html>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#1c1d21", color: "#e6e6e9", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
            reel<span style={{ color: "#a99cf0" }}>m</span>
          </p>
          <h1 style={{ fontSize: 20, margin: "24px 0 8px" }}>Something went wrong</h1>
          <p style={{ color: "#9a9ba3", fontSize: 14, margin: 0 }}>Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ marginTop: 24, border: 0, borderRadius: 999, padding: "10px 24px", fontWeight: 700, color: "#1c1d21", background: "linear-gradient(90deg,#a99cf0,#c9a0b8)", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
