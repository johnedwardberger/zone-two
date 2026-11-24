import { useEffect } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { Toaster } from './components/Toaster'
import { useAppStore } from './store/store'
import { LandingPage } from './features/landing/LandingPage'
import { OnboardingPage } from './features/onboarding/OnboardingPage'
import { DiscoverPage } from './features/discover/DiscoverPage'
import { FeedPage } from './features/feed/FeedPage'
import { PostPage } from './features/post/PostPage'
import { MatchesPage } from './features/matches/MatchesPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { SettingsPage } from './features/settings/SettingsPage'
import { AthleteProfilePage } from './features/profile/AthleteProfilePage'
import { EditProfilePage } from './features/profile/EditProfilePage'
import { Celebration } from './features/matches/Celebration'

/** App pages need a demo profile; otherwise start at the landing page. */
function RequireProfile() {
  const hasProfile = useAppStore((s) => !!s.me)
  return hasProfile ? <Outlet /> : <Navigate to="/" replace />
}

export function App() {
  const resumeDemo = useAppStore((s) => s.resumeDemo)
  useEffect(() => {
    resumeDemo()
  }, [resumeDemo])

  return (
    <HashRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route element={<RequireProfile />}>
          <Route element={<AppShell />}>
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="post" element={<PostPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/edit" element={<EditProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="athlete/:id" element={<AthleteProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Celebration />
      <Toaster />
    </HashRouter>
  )
}
