import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
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

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
