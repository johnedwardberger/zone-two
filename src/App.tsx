import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { LandingPage } from './features/landing/LandingPage'
import { DiscoverPage } from './features/discover/DiscoverPage'
import { FeedPage } from './features/feed/FeedPage'
import { PostPage } from './features/post/PostPage'
import { MatchesPage } from './features/matches/MatchesPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { SettingsPage } from './features/settings/SettingsPage'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route element={<AppShell />}>
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="post" element={<PostPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
