'use client'

import dynamic from 'next/dynamic'

const ProgressCharts = dynamic(() => import('@/components/progress-charts').then(m => m.ProgressCharts), { 
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
})

interface ActionItem {
  id: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface ProgressChartsWrapperProps {
  actionItems: ActionItem[]
}

export function ProgressChartsWrapper({ actionItems }: ProgressChartsWrapperProps) {
  return <ProgressCharts actionItems={actionItems} />
}
