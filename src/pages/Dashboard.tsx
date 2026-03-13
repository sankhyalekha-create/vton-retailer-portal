import { useQuery } from '@tanstack/react-query'
import { getAnalytics } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

interface Stats {
  total_tryons: number
  completed_tryons: number
  success_rate: number
  total_cost_usd: number
  avg_latency_ms: number
  avg_user_rating: number
}

const CARDS = [
  { key: 'total_tryons', label: 'Total Try-Ons', format: (v: number) => v },
  { key: 'success_rate', label: 'Success Rate', format: (v: number) => `${v}%` },
  { key: 'total_cost_usd', label: 'Total Cost', format: (v: number) => `$${v.toFixed(2)}` },
  { key: 'avg_user_rating', label: 'Avg Rating', format: (v: number) => v ? `${v.toFixed(1)} ★` : '—' },
] as const

export default function DashboardPage() {
  const { token } = useAuth()
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['analytics'],
    queryFn: () => getAnalytics(token!) as Promise<Stats>,
    enabled: !!token,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ key, label, format }) => (
          <div key={key} className="bg-white p-6 rounded-2xl border border-gray-200">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {isLoading ? '…' : format((stats?.[key] ?? 0) as number)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
