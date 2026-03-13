import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getConfig, updateConfig } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

interface Config {
  max_trials_per_session?: number
  session_timeout_minutes?: number
  default_engine?: string
  default_model?: string
}

export default function SettingsPage() {
  const { token, user } = useAuth()
  const [cfg, setCfg] = useState<Config>({})

  const { data, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => getConfig(token!) as Promise<Config>,
    enabled: !!token,
  })

  useEffect(() => { if (data) setCfg(data) }, [data])

  const mutation = useMutation({
    mutationFn: () => updateConfig(token!, cfg),
    onSuccess: () => toast.success('Settings saved'),
    onError: (e: Error) => toast.error(e.message),
  })

  const isOwner = user?.role === 'owner'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      {isLoading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max trials per session</label>
            <input
              type="number"
              min={1}
              max={50}
              value={cfg.max_trials_per_session ?? 5}
              onChange={(e) => setCfg({ ...cfg, max_trials_per_session: parseInt(e.target.value) })}
              disabled={!isOwner}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session timeout (minutes)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={cfg.session_timeout_minutes ?? 30}
              onChange={(e) => setCfg({ ...cfg, session_timeout_minutes: parseInt(e.target.value) })}
              disabled={!isOwner}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default engine</label>
            <select
              value={cfg.default_engine ?? 'fashn'}
              onChange={(e) => setCfg({ ...cfg, default_engine: e.target.value })}
              disabled={!isOwner}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
            >
              <option value="fashn">FASHN</option>
              <option value="google_vertex">Google Vertex AI</option>
            </select>
          </div>
          {isOwner && (
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          )}
          {!isOwner && <p className="text-xs text-gray-500">Only the store owner can change settings.</p>}
        </div>
      )}
    </div>
  )
}
