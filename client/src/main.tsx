import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default staleTime is 0, meaning every query is stale the instant
      // it lands - so navigating back to a page visited moments ago
      // re-fetches it from scratch instead of reusing data that's still
      // perfectly good. 30s keeps every page feeling instant on repeat
      // navigation within a session while still refreshing automatically
      // soon enough that nothing goes stale for long.
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
