'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ShimmerLoader() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 justify-items-stretch">
        {/* Completion Pie Chart Shimmer */}
        <div className="bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-12" />
          </div>
          
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="relative">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Priority Bar Chart Shimmer */}
        <div className="bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
          <Skeleton className="h-5 w-40 mb-4" />
          
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="w-full space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Summary Stats Shimmer */}
        <div className="sm:col-span-2 xl:col-span-1 bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
          <Skeleton className="h-5 w-20 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-3 lg:gap-4 flex-1">
            <div className="text-center flex flex-col justify-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="text-center flex flex-col justify-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="text-center flex flex-col justify-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="text-center flex flex-col justify-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
