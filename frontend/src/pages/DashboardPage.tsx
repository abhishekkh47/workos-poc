// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user, logout } = useAuth();
  // const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // navigates browser to /auth/logout → WorkOS logout → /login
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-semibold text-white">WorkOS POC</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-5">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={fullName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold ring-2 ring-indigo-500/50">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome, {fullName}!</h1>
              <p className="text-indigo-300 mt-1">You've successfully authenticated via WorkOS.</p>
            </div>
          </div>
        </div>

        {/* User details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-base font-semibold text-white">Your Profile</h2>
            <p className="text-sm text-gray-400 mt-0.5">Details returned from WorkOS and stored in PostgreSQL</p>
          </div>
          <div className="divide-y divide-gray-800">
            <ProfileRow label="Full name" value={fullName} />
            <ProfileRow label="Email address" value={user?.email ?? '—'} />
            <ProfileRow label="Local DB ID" value={user?.id ?? '—'} mono />
            <ProfileRow
              label="Member since"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'
              }
            />
          </div>
        </div>

        {/* Auth flow info */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Authentication Flow</h2>
          <ol className="space-y-3">
            {[
              'You clicked a sign-in button on the Login page',
              'Backend generated a WorkOS Authorization URL and redirected you',
              'You authenticated via the WorkOS hosted UI (email / Google / GitHub)',
              'WorkOS redirected back to /auth/callback with an authorization code',
              'Backend exchanged the code for your user profile',
              'Your profile was upserted into the local PostgreSQL database',
              'A signed JWT was stored in an HTTP-only cookie',
              'You were redirected here — this page fetches your profile via /api/me',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 text-xs flex items-center justify-center font-semibold">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm text-white ${mono ? 'font-mono text-xs text-gray-300' : ''}`}>
        {value}
      </span>
    </div>
  );
}
