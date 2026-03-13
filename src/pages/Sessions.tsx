import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createSession, listSessions, topupSession, revokeSession } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

interface Session {
  id: string
  pin: string
  token: string
  status: string
  max_trials: number
  trials_used: number
  expires_at: string
  created_at: string
  gallery_url: string | null
}

export default function SessionsPage() {
  const { token } = useAuth()
  const qc = useQueryClient()
  const [maxTrials, setMaxTrials] = useState<number | ''>('')

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: () => listSessions(token!) as Promise<Session[]>,
    enabled: !!token,
  })

  const createMutation = useMutation({
    mutationFn: () => createSession(token!, maxTrials || undefined),
    onSuccess: (s: Session) => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      toast.success(`Session created! PIN: ${s.pin}`, { duration: 8000 })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const topupMutation = useMutation({
    mutationFn: ({ sessionId, extra }: { sessionId: string; extra: number }) =>
      topupSession(token!, sessionId, extra),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sessions'] }); toast.success('Trials added') },
    onError: (e: Error) => toast.error(e.message),
  })

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => revokeSession(token!, sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sessions'] }); toast.success('Session revoked') },
    onError: (e: Error) => toast.error(e.message),
  })

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-600',
    completed: 'bg-blue-100 text-blue-800',
    revoked: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={1}
            max={20}
            placeholder="Trials (default)"
            value={maxTrials}
            onChange={(e) => setMaxTrials(e.target.value ? parseInt(e.target.value) : '')}
            className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating…' : '+ New Session'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['PIN', 'Status', 'Trials', 'Expires', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-lg">{s.pin}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] ?? ''}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.trials_used} / {s.max_trials}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(s.expires_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {s.status === 'active' && (
                      <>
                        <button
                          onClick={() => topupMutation.mutate({ sessionId: s.id, extra: 3 })}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                        >
                          +3 trials
                        </button>
                        <button
                          onClick={() => revokeMutation.mutate(s.id)}
                          className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-red-600"
                        >
                          Revoke
                        </button>
                      </>
                    )}
                    {s.gallery_url && (
                      <a href={s.gallery_url} target="_blank" className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-blue-600">
                        Gallery
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
