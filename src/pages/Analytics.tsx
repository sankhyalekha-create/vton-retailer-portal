import { useQuery } from '@tanstack/react-query'
import { getAnalytics } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

export default function AnalyticsPage() {
  const { token } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => getAnalytics(token!),
    enabled: !!token,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      {isLoading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <pre className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-700 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
