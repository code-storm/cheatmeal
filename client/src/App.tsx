import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { RewardToastProvider } from "./hooks/RewardToastContext";
import { RewardPreviewProvider } from "./hooks/RewardPreviewContext";
import { UnlockCelebrationProvider } from "./hooks/UnlockCelebrationContext";
import {
  RedirectIfAuthenticated,
  RequireAuthAndProfile,
  RequireAuthNoProfile,
} from "./components/RouteGuards";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import TodayPage from "./pages/TodayPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import MacroHistoryPage from "./pages/MacroHistoryPage";
import RewardsPage from "./pages/RewardsPage";
import WardrobePage from "./pages/WardrobePage";

export default function App() {
  return (
    <BrowserRouter>
      <RewardToastProvider>
        <RewardPreviewProvider>
          <UnlockCelebrationProvider>
            <Routes>
              <Route
                path="/signup"
                element={
                  <RedirectIfAuthenticated>
                    <SignupPage />
                  </RedirectIfAuthenticated>
                }
              />
              <Route
                path="/login"
                element={
                  <RedirectIfAuthenticated>
                    <LoginPage />
                  </RedirectIfAuthenticated>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <RequireAuthNoProfile>
                    <OnboardingPage />
                  </RequireAuthNoProfile>
                }
              />

              <Route
                element={
                  <RequireAuthAndProfile>
                    <AppLayout />
                  </RequireAuthAndProfile>
                }
              >
                <Route path="/" element={<TodayPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/macros" element={<MacroHistoryPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/wardrobe" element={<WardrobePage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </UnlockCelebrationProvider>
        </RewardPreviewProvider>
      </RewardToastProvider>
    </BrowserRouter>
  );
}
