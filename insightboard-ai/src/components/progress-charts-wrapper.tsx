'use client'

import dynamic from 'next/dynamic'
import { ShimmerLoader } from '@/components/shimmer-loader'
import { useEffect, useState } from 'react'

const ProgressCharts = dynamic(() => import('@/components/progress-charts').then(m => m.ProgressCharts), { 
  ssr: false,
  loading: () => <ShimmerLoader />
})

interface ActionItem {
  id: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface ProgressChartsWrapperProps {
  actionItems: ActionItem[]
  isLoading?: boolean
}

export function ProgressChartsWrapper({ actionItems, isLoading = false }: ProgressChartsWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <ShimmerLoader />
  }

  if (isLoading) {
    return <ShimmerLoader />
  }
  
  return <ProgressCharts actionItems={actionItems} />
}
