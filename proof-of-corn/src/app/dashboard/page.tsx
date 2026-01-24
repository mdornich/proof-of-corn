'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';

const FRED_API = 'https://farmer-fred.sethgoldstein.workers.dev';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  category?: string;
  processed?: boolean;
  status?: string;
}

interface Task {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  assignedTo: string;
}

interface HNData {
  post: {
    score: number;
    commentCount: number;
    hoursAgo: number;
    hnUrl: string;
  };
  topThemes: string[];
  questionsNeedingResponse: Array<{ author: string; text: string }>;
  recentComments: Array<{
    author: string;
    text: string;
    sentiment: string;
    hoursAgo: number;
  }>;
}

interface Weather {
  region: string;
  temperature: number;
  conditions: string;
  plantingViable: boolean;
}

export default function DashboardPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hn, setHn] = useState<HNData | null>(null);
  const [weather, setWeather] = useState<Weather[]>([]);
  const [loading, setLoading] = useState(true);
  const [actResult, setActResult] = useState<any>(null);
  const [acting, setActing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inboxRes, tasksRes, hnRes, weatherRes] = await Promise.all([
        fetch(`${FRED_API}/inbox`),
        fetch(`${FRED_API}/tasks`),
        fetch(`${FRED_API}/hn`),
        fetch(`${FRED_API}/weather`),
      ]);

      if (inboxRes.ok) {
        const data = await inboxRes.json();
        setEmails(data.emails || []);
      }
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }
      if (hnRes.ok) {
        const data = await hnRes.json();
        setHn(data);
      }
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        setWeather(data.weather || []);
      }
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Failed to fetch:', e);
    }
    setLoading(false);
  };

  const triggerAct = async () => {
    setActing(true);
    setActResult(null);
    try {
      const res = await fetch(`${FRED_API}/act`, { method: 'POST' });
      const data = await res.json();
      setActResult(data);
      fetchAll();
    } catch (e) {
      setActResult({ error: String(e) });
    }
    setActing(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const priorityColor = (p: string) => {
    if (p === 'high') return 'bg-red-100 text-red-800';
    if (p === 'medium') return 'bg-amber-100 text-amber-800';
    return 'bg-zinc-100 text-zinc-600';
  };

  const sentimentColor = (s: string) => {
    if (s === 'positive') return 'text-green-600';
    if (s === 'negative') return 'text-red-600';
    if (s === 'question') return 'text-blue-600';
    return 'text-zinc-500';
  };

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Real-time view into Farmer Fred's operations. Full transparency."
    >
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6 text-sm">
            <span className="text-zinc-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={fetchAll}
                disabled={loading}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={triggerAct}
                disabled={acting}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium transition-colors"
              >
                {acting ? 'Thinking...' : 'Ask Fred to Act'}
              </button>
            </div>
          </div>

          {/* Act Result Banner */}
          {actResult && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-amber-800 mb-2">Fred&apos;s Decision</h3>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                    {actResult.decision || actResult.error}
                  </p>
                  {actResult.state && (
                    <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                      <span>Emails: {actResult.state.unreadEmails}</span>
                      <span>Tasks: {actResult.state.pendingTasks}</span>
                      <span>HN: {actResult.state.hnComments} comments</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setActResult(null)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{emails.length}</div>
              <div className="text-xs text-zinc-500 uppercase">Emails</div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {tasks.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-xs text-zinc-500 uppercase">Pending Tasks</div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{hn?.post?.score || '—'}</div>
              <div className="text-xs text-zinc-500 uppercase">HN Points</div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {weather.filter(w => w.plantingViable).length}/{weather.length}
              </div>
              <div className="text-xs text-zinc-500 uppercase">Regions Ready</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Inbox */}
            <section className="bg-white border border-zinc-200 rounded-lg p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                Inbox
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {emails.length}
                </span>
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {emails.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No emails</p>
                ) : (
                  emails.slice(0, 8).map((email) => (
                    <div
                      key={email.id}
                      className="p-3 bg-zinc-50 rounded border border-zinc-100"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm truncate flex-1">
                          {email.from}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          email.category === 'lead' ? 'bg-green-100 text-green-700' :
                          email.category === 'partnership' ? 'bg-blue-100 text-blue-700' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                          {email.category || 'other'}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-700 truncate">{email.subject}</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {new Date(email.receivedAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Task Queue */}
            <section className="bg-white border border-zinc-200 rounded-lg p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                Tasks
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === 'pending').length} pending
                </span>
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No tasks</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 bg-zinc-50 rounded border ${
                        task.status === 'completed' ? 'border-green-200 opacity-60' : 'border-zinc-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${priorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-zinc-400">{task.status}</span>
                      </div>
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-zinc-500 mt-1 truncate">
                        {task.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Weather */}
            <section className="bg-white border border-zinc-200 rounded-lg p-5">
              <h2 className="font-bold text-lg mb-4">Weather by Region</h2>
              <div className="space-y-3">
                {weather.length === 0 ? (
                  <p className="text-zinc-500 text-sm">Loading weather...</p>
                ) : (
                  weather.map((w) => (
                    <div
                      key={w.region}
                      className="flex items-center justify-between p-3 bg-zinc-50 rounded"
                    >
                      <div>
                        <div className="font-medium">{w.region}</div>
                        <div className="text-sm text-zinc-500">{w.conditions}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {Math.round(w.temperature)}°F
                        </div>
                        <div className={`text-xs ${w.plantingViable ? 'text-green-600' : 'text-red-500'}`}>
                          {w.plantingViable ? '✓ Plantable' : '✗ Not ready'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* HN Summary */}
            <section className="bg-white border border-zinc-200 rounded-lg p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-orange-500">Y</span> Hacker News
                {hn?.post && (
                  <a
                    href={hn.post.hnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-600 hover:underline ml-auto"
                  >
                    View discussion →
                  </a>
                )}
              </h2>
              {hn?.post ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-zinc-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">{hn.post.score}</div>
                      <div className="text-xs text-zinc-500">points</div>
                    </div>
                    <div className="text-center p-2 bg-zinc-50 rounded">
                      <div className="text-2xl font-bold text-amber-600">{hn.post.commentCount}</div>
                      <div className="text-xs text-zinc-500">comments</div>
                    </div>
                    <div className="text-center p-2 bg-zinc-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {hn.questionsNeedingResponse?.length || 0}
                      </div>
                      <div className="text-xs text-zinc-500">questions</div>
                    </div>
                  </div>

                  {hn.topThemes && hn.topThemes.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-zinc-500 mb-2">Discussion Themes</div>
                      <div className="flex flex-wrap gap-1">
                        {hn.topThemes.slice(0, 6).map((theme, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-amber-50 text-amber-800 rounded">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-zinc-500 mb-2">Recent Comments</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {hn.recentComments?.slice(0, 4).map((c, i) => (
                      <div key={i} className="text-xs p-2 bg-zinc-50 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">@{c.author}</span>
                          <span className={sentimentColor(c.sentiment)}>{c.sentiment}</span>
                          <span className="text-zinc-400 ml-auto">{c.hoursAgo}h</span>
                        </div>
                        <div className="text-zinc-600 truncate">{c.text.slice(0, 80)}...</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-zinc-500 text-sm">Loading HN data...</p>
              )}
            </section>
          </div>

          {/* API Quick Links */}
          <section className="mt-8 bg-white border border-zinc-200 rounded-lg p-5">
            <h2 className="font-bold text-lg mb-2">Fred&apos;s API</h2>
            <p className="text-sm text-zinc-500 mb-4">
              Everything Fred does is accessible via API. Full transparency.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              {[
                { path: '/inbox', label: 'Inbox' },
                { path: '/tasks', label: 'Tasks' },
                { path: '/weather', label: 'Weather' },
                { path: '/hn', label: 'HN Stats' },
                { path: '/constitution', label: 'Constitution' },
                { path: '/status', label: 'Status' },
                { path: '/log', label: 'Log' },
              ].map((ep) => (
                <a
                  key={ep.path}
                  href={`${FRED_API}${ep.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors"
                >
                  {ep.label}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
