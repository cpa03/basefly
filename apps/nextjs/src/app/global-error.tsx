"use client";

/**
 * Global Error Boundary
 *
 * This component catches unexpected errors in the root layout.
 * It replaces the entire root layout when an error occurs, so it must
 * define its own <html> and <body> tags.
 *
 * IMPORTANT: This component uses inline styles (not Tailwind classes)
 * because the root layout that loads global CSS and component libraries
 * may be broken when this boundary is triggered. Inline styles ensure
 * the error UI renders reliably in any failure scenario.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={bodyStyles}>
        <div style={containerStyles}>
          <div style={contentStyles}>
            <h1 style={headingStyles}>Something went wrong</h1>
            <p style={descriptionStyles}>
              An unexpected error occurred. Please try again or contact support
              if the problem persists.
            </p>
            {error.digest && (
              <p style={errorIdStyles}>Error ID: {error.digest}</p>
            )}
          </div>
          <div style={actionsStyles}>
            <button onClick={reset} style={primaryButtonStyles}>
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={secondaryButtonStyles}
            >
              Go to homepage
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

// Inline styles — root layout CSS may be unavailable when this renders
const bodyStyles: React.CSSProperties = {
  margin: 0,
  minHeight: "100vh",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  backgroundColor: "#fafafa",
  color: "#111",
};

const containerStyles: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
};

const contentStyles: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "1.5rem",
};

const headingStyles: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: 700,
  letterSpacing: "-0.025em",
  lineHeight: 1.2,
  margin: "0 0 0.75rem",
};

const descriptionStyles: React.CSSProperties = {
  fontSize: "1rem",
  lineHeight: 1.6,
  color: "#666",
  maxWidth: "28rem",
  margin: "0",
};

const errorIdStyles: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "0.75rem",
  color: "#999",
  marginTop: "1rem",
};

const actionsStyles: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
};

const primaryButtonStyles: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  backgroundColor: "#111",
  color: "#fff",
  border: "none",
  borderRadius: "0.375rem",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "0.875rem",
};

const secondaryButtonStyles: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  backgroundColor: "transparent",
  color: "#111",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "0.875rem",
};
