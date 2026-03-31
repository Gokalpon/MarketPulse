import React, { Suspense } from "react";
import MarketPulseApp from "@/components/market/MarketPulseApp";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: "100%",
            height: "100vh",
            background: "#030508",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
            textAlign: "center",
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
            zIndex: 9999,
          }}
        >
          <div style={{ maxWidth: "500px" }}>
            <h1 style={{ marginBottom: "10px", color: "#FF6B6B", fontSize: "32px" }}>
              🔴 RENDER ERROR
            </h1>
            <p style={{ marginBottom: "20px", color: "#FFD700", fontSize: "16px" }}>
              App failed to load
            </p>
            <p
              style={{
                background: "#1a1a2e",
                border: "2px solid #FF6B6B",
                padding: "15px",
                borderRadius: "8px",
                fontSize: "14px",
                wordBreak: "break-word",
                maxHeight: "250px",
                overflow: "auto",
                textAlign: "left",
                color: "#FFD700",
              }}
            >
              <strong>Error:</strong> {this.state.error?.toString()}
            </p>
            <p style={{ marginTop: "20px", fontSize: "12px", color: "#00FFFF" }}>
              Press F12 to open Developer Console for full error details
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Loading = () => (
  <div
    style={{
      width: "100%",
      height: "100vh",
      background: "#030508",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#00FFFF",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}
  >
    Loading app...
  </div>
);

const Index = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <MarketPulseApp />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Index;
