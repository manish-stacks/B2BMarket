interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red'
}

const colorMap = {
  orange: 'bg-orange-100 text-orange-600',
  blue:   'bg-blue-100 text-blue-600',
  green:  'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  red:    'bg-red-100 text-red-600',
}

export default function StatCard({ title, value, icon, change, changeType = 'neutral', color = 'orange' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 font-medium ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
