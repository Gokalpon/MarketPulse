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
        {/* iPhone 17 Mockup */}
        <div style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse 120% 100% at 50% 0%, #0d1520 0%, #060709 55%, #030407 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          boxSizing: "border-box",
        }}>
          <div style={{ position: "relative" }}>

            {/* Action button (left top) */}
            <div style={{ position: "absolute", left: -3.5, top: 112, width: 3.5, height: 34, borderRadius: "2px 0 0 2px", background: "linear-gradient(to right, #5c5c5e, #3a3a3c)", boxShadow: "-1px 0 3px rgba(0,0,0,0.5)" }} />
            {/* Volume up */}
            <div style={{ position: "absolute", left: -3.5, top: 166, width: 3.5, height: 62, borderRadius: "2px 0 0 2px", background: "linear-gradient(to right, #5c5c5e, #3a3a3c)", boxShadow: "-1px 0 3px rgba(0,0,0,0.5)" }} />
            {/* Volume down */}
            <div style={{ position: "absolute", left: -3.5, top: 242, width: 3.5, height: 62, borderRadius: "2px 0 0 2px", background: "linear-gradient(to right, #5c5c5e, #3a3a3c)", boxShadow: "-1px 0 3px rgba(0,0,0,0.5)" }} />
            {/* Power button (right) */}
            <div style={{ position: "absolute", right: -3.5, top: 180, width: 3.5, height: 80, borderRadius: "0 2px 2px 0", background: "linear-gradient(to left, #5c5c5e, #3a3a3c)", boxShadow: "1px 0 3px rgba(0,0,0,0.5)" }} />

            {/* Outer titanium frame */}
            <div style={{
              borderRadius: 54,
              padding: 11,
              background: "linear-gradient(160deg, #52525a 0%, #2e2e32 35%, #1a1a1e 65%, #38383c 100%)",
              boxShadow: [
                "0 0 0 0.5px rgba(255,255,255,0.14)",
                "0 40px 100px rgba(0,0,0,0.95)",
                "0 12px 40px rgba(0,0,0,0.7)",
                "inset 0 1px 0 rgba(255,255,255,0.22)",
                "inset 0 -1px 0 rgba(0,0,0,0.6)",
                "inset 1px 0 0 rgba(255,255,255,0.06)",
                "inset -1px 0 0 rgba(255,255,255,0.06)",
              ].join(", "),
            }}>
              {/* Inner frame ring (subtle darker inset) */}
              <div style={{
                borderRadius: 45,
                padding: 1.5,
                background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)",
              }}>
                {/* Screen area */}
                <div style={{
                  width: 390,
                  height: 844,
                  borderRadius: 44,
                  overflow: "hidden",
                  position: "relative",
                  background: "#000",
                }}>
                  {/* App content */}
                  <MarketPulseApp containerHeight={844} />

                  {/* Dynamic Island overlay */}
                  <div style={{
                    position: "absolute",
                    top: 14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 126,
                    height: 37,
                    background: "#000",
                    borderRadius: 20,
                    zIndex: 10000,
                    pointerEvents: "none",
                  }} />

                  {/* Top status bar spacer (covers content behind Dynamic Island) */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 59,
                    pointerEvents: "none",
                    zIndex: 9999,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, transparent 100%)",
                  }} />
                </div>
              </div>
            </div>

            {/* Reflection highlight on frame */}
            <div style={{
              position: "absolute",
              top: 11, left: 11, right: 11,
              height: "40%",
              borderRadius: "44px 44px 60% 60%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }} />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Index;
