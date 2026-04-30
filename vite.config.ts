import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/market": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "vendor-react": ["react", "react-dom"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs"],
          "vendor-motion": ["motion/react"],
          "vendor-query": ["@tanstack/react-query"],
          // Feature chunks
          "market-tabs": [
            "./src/components/market/tabs/DashboardTab.tsx",
            "./src/components/market/tabs/CommunityTab.tsx",
            "./src/components/market/tabs/ProfileTab.tsx",
          ],
          "market-sheets": [
            "./src/components/market/sheets/CommentSheet.tsx",
            "./src/components/market/sheets/DetailedPointSheet.tsx",
            "./src/components/market/sheets/MyCommentsSheet.tsx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
