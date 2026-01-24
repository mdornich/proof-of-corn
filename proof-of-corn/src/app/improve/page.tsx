'use client';

import { useEffect, useState } from 'react';
import PageLayout from "@/components/PageLayout";

const FRED_API = 'https://farmer-fred.sethgoldstein.workers.dev';

interface Learning {
  id: string;
  source: string;
  insight: string;
  category: string;
  confidence: string;
  createdAt: string;
  appliedCount: number;
}

interface Feedback {
  id: string;
  author: string;
  type: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function ImprovePage() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [feedbackType, setFeedbackType] = useState<string>('suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [learningsRes, feedbackRes] = await Promise.all([
        fetch(`${FRED_API}/learnings`),
        fetch(`${FRED_API}/feedback`)
      ]);

      if (learningsRes.ok) {
        const data = await learningsRes.json();
        setLearnings(data.learnings || []);
      }
      if (feedbackRes.ok) {
        const data = await feedbackRes.json();
        setFeedback(data.feedback || []);
      }
    } catch (e) {
      console.error('Failed to fetch:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch(`${FRED_API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          content: feedbackContent,
          author: authorName || 'Anonymous'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitResult({ success: true, message: data.message });
        setFeedbackContent('');
        setAuthorName('');
        fetchData(); // Refresh the lists
      } else {
        setSubmitResult({ success: false, message: data.error || 'Failed to submit' });
      }
    } catch (e) {
      setSubmitResult({ success: false, message: 'Network error. Please try again.' });
    }

    setSubmitting(false);
  };

  const sourceIcon = (source: string) => {
    switch (source) {
      case 'email': return '📧';
      case 'hn': return '🟠';
      case 'feedback': return '💬';
      case 'decision': return '🧠';
      default: return '📝';
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-blue-50 text-blue-700';
      case 'improvement': return 'bg-green-50 text-green-700';
      case 'bug': return 'bg-red-50 text-red-700';
      case 'question': return 'bg-purple-50 text-purple-700';
      case 'praise': return 'bg-amber-50 text-amber-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'incorporated':
        return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Incorporated</span>;
      case 'reviewed':
        return <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">Reviewed</span>;
      case 'declined':
        return <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">Declined</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">Pending</span>;
    }
  };

  return (
    <PageLayout
      title="Help Fred Get Smarter"
      subtitle="Every email, comment, and suggestion helps Farmer Fred learn and improve."
    >
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Intro */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <h2 className="font-bold text-lg mb-2">How Fred Learns</h2>
            <p className="text-zinc-700 text-sm mb-4">
              Farmer Fred is an autonomous agent that gets smarter from every interaction:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">📧</span>
                <div>
                  <strong>Emails</strong>
                  <p className="text-zinc-600">Learns from farmer conversations, partnership offers, and questions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">🟠</span>
                <div>
                  <strong>Hacker News</strong>
                  <p className="text-zinc-600">Monitors discussion, extracts insights, answers questions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">💬</span>
                <div>
                  <strong>Your Feedback</strong>
                  <p className="text-zinc-600">Community suggestions directly improve Fred&apos;s behavior</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Submit Feedback Form */}
            <section className="bg-white border border-zinc-200 rounded-lg p-6">
              <h2 className="font-bold text-lg mb-4">Submit Feedback</h2>

              <form onSubmit={submitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                  >
                    <option value="suggestion">Suggestion - How Fred could work better</option>
                    <option value="improvement">Improvement - Something specific to change</option>
                    <option value="question">Question - Something you want to understand</option>
                    <option value="bug">Bug - Something seems broken</option>
                    <option value="praise">Praise - Something Fred did well</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Your Feedback</label>
                  <textarea
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="Share your thoughts on how Fred could improve..."
                    rows={4}
                    maxLength={2000}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm resize-none"
                  />
                  <p className="text-xs text-zinc-400 mt-1">{feedbackContent.length}/2000</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Your Name (optional)</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Anonymous"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || feedbackContent.length < 10}
                  className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-300 text-white rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>

                {submitResult && (
                  <div className={`p-3 rounded-lg text-sm ${
                    submitResult.success
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {submitResult.message}
                  </div>
                )}
              </form>
            </section>

            {/* Fred's Learnings */}
            <section className="bg-white border border-zinc-200 rounded-lg p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                Fred&apos;s Learnings
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                  {learnings.length}
                </span>
              </h2>

              {loading ? (
                <p className="text-zinc-500 text-sm">Loading learnings...</p>
              ) : learnings.length === 0 ? (
                <p className="text-zinc-500 text-sm">Fred is just getting started. Learnings will appear here as he processes emails and feedback.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {learnings.slice(0, 10).map((learning) => (
                    <div key={learning.id} className="p-3 bg-zinc-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{sourceIcon(learning.source)}</span>
                        <div className="flex-1">
                          <p className="text-sm">{learning.insight}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-zinc-400">{learning.category}</span>
                            <span className="text-xs text-zinc-300">•</span>
                            <span className="text-xs text-zinc-400">
                              {new Date(learning.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <a
                href={`${FRED_API}/learnings`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-sm text-amber-600 hover:underline"
              >
                View all learnings (JSON) →
              </a>
            </section>
          </div>

          {/* Community Feedback */}
          <section className="mt-8 bg-white border border-zinc-200 rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              Community Feedback
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {feedback.length} total
              </span>
              {feedback.filter(f => f.status === 'incorporated').length > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {feedback.filter(f => f.status === 'incorporated').length} incorporated
                </span>
              )}
            </h2>

            {loading ? (
              <p className="text-zinc-500 text-sm">Loading feedback...</p>
            ) : feedback.length === 0 ? (
              <p className="text-zinc-500 text-sm">No feedback yet. Be the first to help Fred improve!</p>
            ) : (
              <div className="space-y-3">
                {feedback.slice(0, 8).map((fb) => (
                  <div key={fb.id} className="p-4 bg-zinc-50 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${typeColor(fb.type)}`}>
                          {fb.type}
                        </span>
                        {statusBadge(fb.status)}
                      </div>
                      <span className="text-xs text-zinc-400">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700">{fb.content}</p>
                    <p className="text-xs text-zinc-400 mt-2">— {fb.author}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* API Links */}
          <div className="mt-8 text-center text-sm text-zinc-500">
            <p>Full transparency. All data accessible via API:</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href={`${FRED_API}/learnings`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                /learnings
              </a>
              <a href={`${FRED_API}/feedback`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                /feedback
              </a>
              <a href={`${FRED_API}/log`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                /log
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
