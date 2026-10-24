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
import EventDetailPage from "./pages/EventDetailPage";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import { RequireAdminAuth, RedirectIfAdminAuthenticated } from "./admin/components/AdminRouteGuards";
import { AdminLayout } from "./admin/components/AdminLayout";
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import AdminEventsListPage from "./admin/pages/AdminEventsListPage";
import AdminEventFormPage from "./admin/pages/AdminEventFormPage";
import AdminRewardsListPage from "./admin/pages/AdminRewardsListPage";
import AdminRewardFormPage from "./admin/pages/AdminRewardFormPage";
import AdminBadgesListPage from "./admin/pages/AdminBadgesListPage";
import AdminBadgeFormPage from "./admin/pages/AdminBadgeFormPage";

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
                <Route path="/events/:slug" element={<EventDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Fully separate auth system from the consumer app above -
                  AdminAuthProvider is scoped to only this subtree (not
                  wrapping the whole <App>) so GET /api/admin/auth/me
                  never fires for a regular visitor who never goes near
                  /admin. Must stay before the catch-all "*" route below,
                  or that catch-all would swallow every /admin/* path. */}
              <Route
                path="/admin/*"
                element={
                  <AdminAuthProvider>
                    <Routes>
                      <Route
                        path="login"
                        element={
                          <RedirectIfAdminAuthenticated>
                            <AdminLoginPage />
                          </RedirectIfAdminAuthenticated>
                        }
                      />
                      <Route
                        element={
                          <RequireAdminAuth>
                            <AdminLayout />
                          </RequireAdminAuth>
                        }
                      >
                        <Route index element={<Navigate to="events" replace />} />
                        <Route path="events" element={<AdminEventsListPage />} />
                        <Route path="events/new" element={<AdminEventFormPage />} />
                        <Route path="events/:id" element={<AdminEventFormPage />} />
                        <Route path="rewards" element={<AdminRewardsListPage />} />
                        <Route path="rewards/new" element={<AdminRewardFormPage />} />
                        <Route path="rewards/:id" element={<AdminRewardFormPage />} />
                        <Route path="badges" element={<AdminBadgesListPage />} />
                        <Route path="badges/new" element={<AdminBadgeFormPage />} />
                        <Route path="badges/:id" element={<AdminBadgeFormPage />} />
                      </Route>
                    </Routes>
                  </AdminAuthProvider>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </UnlockCelebrationProvider>
        </RewardPreviewProvider>
      </RewardToastProvider>
    </BrowserRouter>
  );
}
