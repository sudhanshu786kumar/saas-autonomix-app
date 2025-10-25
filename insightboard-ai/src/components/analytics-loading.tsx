'use client'

import { ShimmerLoader } from '@/components/shimmer-loader'

interface AnalyticsLoadingProps {
  isLoading: boolean
  children: React.ReactNode
}

export function AnalyticsLoading({ isLoading, children }: AnalyticsLoadingProps) {
  if (isLoading) {
    return <ShimmerLoader />
  }
  
  return <>{children}</>
}
