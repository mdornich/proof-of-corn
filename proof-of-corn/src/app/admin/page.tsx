'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const FRED_API = 'https://farmer-fred.sethgoldstein.workers.dev';

interface AdminEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  status: string;
  category?: string;
  securityCheck?: {
    isSafe: boolean;
    threat: string;
    confidence: number;
    flaggedPatterns: string[];
    recommendation: string;
  };
}

export default function AdminDashboard() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [emails, setEmails] = useState<AdminEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<AdminEmail | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${FRED_API}/admin/inbox`, {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
        setIsAuthed(true);
        // Store password in session for subsequent requests
        sessionStorage.setItem('admin_pass', password);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to connect to Fred API');
    }

    setLoading(false);
  };

  const loadEmails = async () => {
    const pass = sessionStorage.getItem('admin_pass');
    if (!pass) return;

    setLoading(true);
    try {
      const response = await fetch(`${FRED_API}/admin/inbox`, {
        headers: {
          'Authorization': `Bearer ${pass}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
      } else {
        setIsAuthed(false);
        sessionStorage.removeItem('admin_pass');
      }
    } catch (err) {
      setError('Failed to load emails');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check if already authenticated
    const pass = sessionStorage.getItem('admin_pass');
    if (pass) {
      setPassword(pass);
      loadEmails();
      setIsAuthed(true);
    }
  }, []);

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white border border-zinc-200 rounded-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-sm text-zinc-500">Proof of Corn - Farmer Fred</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/dashboard" className="text-sm text-amber-600 hover:underline">
                ← Back to Public Dashboard
              </Link>
            </div>

            <div className="mt-6 p-4 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-600">
              <p className="font-semibold mb-2">⚠️ Admin Access</p>
              <p>This dashboard shows full unredacted emails including suspicious/blocked messages. Password required.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const suspiciousEmails = emails.filter(e => e.category === 'suspicious' || e.securityCheck?.recommendation === 'block');
  const blockedEmails = emails.filter(e => e.securityCheck?.recommendation === 'block');

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-zinc-500">Full unredacted access to Farmer Fred's inbox</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadEmails}
              disabled={loading}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('admin_pass');
                setIsAuthed(false);
              }}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="text-2xl font-bold">{emails.length}</div>
            <div className="text-sm text-zinc-500">Total Emails</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="text-2xl font-bold">{emails.filter(e => e.status === 'unread').length}</div>
            <div className="text-sm text-zinc-500">Unread</div>
          </div>
          <div className="bg-white border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-700">{suspiciousEmails.length}</div>
            <div className="text-sm text-yellow-600">Suspicious</div>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="text-2xl font-bold text-red-700">{blockedEmails.length}</div>
            <div className="text-sm text-red-600">Blocked</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="md:col-span-1 bg-white border border-zinc-200 rounded-lg">
            <div className="p-4 border-b border-zinc-200">
              <h2 className="font-bold">All Emails</h2>
            </div>
            <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-4 hover:bg-zinc-50 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm truncate flex-1">{email.from}</span>
                    {email.securityCheck && !email.securityCheck.isSafe && (
                      <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                        email.securityCheck.recommendation === 'block' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {email.securityCheck.threat}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-700 truncate mb-1">{email.subject}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">
                      {new Date(email.receivedAt).toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      email.category === 'lead' ? 'bg-green-100 text-green-700' :
                      email.category === 'partnership' ? 'bg-blue-100 text-blue-700' :
                      email.category === 'suspicious' ? 'bg-red-100 text-red-700' :
                      'bg-zinc-100 text-zinc-500'
                    }`}>
                      {email.category || 'other'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email Detail */}
          <div className="md:col-span-2 bg-white border border-zinc-200 rounded-lg">
            {selectedEmail ? (
              <div>
                <div className="p-4 border-b border-zinc-200">
                  <h2 className="font-bold text-lg mb-2">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <span><strong>From:</strong> {selectedEmail.from}</span>
                    <span><strong>Date:</strong> {new Date(selectedEmail.receivedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Alert */}
                {selectedEmail.securityCheck && !selectedEmail.securityCheck.isSafe && (
                  <div className={`p-4 border-b ${
                    selectedEmail.securityCheck.recommendation === 'block' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⚠️</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">Security Alert</p>
                        <p className="text-xs mb-2">
                          <strong>Threat:</strong> {selectedEmail.securityCheck.threat} ({Math.round(selectedEmail.securityCheck.confidence * 100)}% confidence)
                        </p>
                        <p className="text-xs mb-2">
                          <strong>Recommendation:</strong> {selectedEmail.securityCheck.recommendation.toUpperCase()}
                        </p>
                        {selectedEmail.securityCheck.flaggedPatterns.length > 0 && (
                          <details className="text-xs">
                            <summary className="cursor-pointer font-medium">Flagged Patterns ({selectedEmail.securityCheck.flaggedPatterns.length})</summary>
                            <ul className="mt-1 ml-4 space-y-1">
                              {selectedEmail.securityCheck.flaggedPatterns.map((pattern, i) => (
                                <li key={i} className="font-mono">{pattern}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Body */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Email Body (Full Unredacted)</h3>
                  <div className="prose prose-sm prose-zinc max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-zinc-50 p-4 rounded border border-zinc-200">
                      {selectedEmail.body}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                <p>Select an email to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
