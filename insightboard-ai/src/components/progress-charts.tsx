'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ActionItem {
  id: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface ProgressChartsProps {
  actionItems: ActionItem[]
}

export function ProgressCharts({ actionItems }: ProgressChartsProps) {
  const completedCount = actionItems.filter(item => item.status === 'COMPLETED').length
  const pendingCount = actionItems.filter(item => item.status === 'PENDING').length
  
  const completionData = [
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' }
  ]

  const priorityData = [
    { 
      name: 'High', 
      value: actionItems.filter(item => item.priority === 'HIGH').length,
      color: '#ef4444'
    },
    { 
      name: 'Medium', 
      value: actionItems.filter(item => item.priority === 'MEDIUM').length,
      color: '#f59e0b'
    },
    { 
      name: 'Low', 
      value: actionItems.filter(item => item.priority === 'LOW').length,
      color: '#10b981'
    }
  ]

  const completionRate = actionItems.length > 0 
    ? Math.round((completedCount / actionItems.length) * 100) 
    : 0

  if (actionItems.length === 0) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 justify-items-stretch">
          <div className="bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-4">Task Completion</h3>
            <div className="flex items-center justify-center flex-1 text-gray-500">
              <p className="text-xs sm:text-sm lg:text-base">No data to display</p>
            </div>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-4">Priority Distribution</h3>
            <div className="flex items-center justify-center flex-1 text-gray-500">
              <p className="text-xs sm:text-sm lg:text-base">No data to display</p>
            </div>
          </div>
          <div className="sm:col-span-2 xl:col-span-1 bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-4">Summary</h3>
            <div className="flex items-center justify-center flex-1 text-gray-500">
              <p className="text-xs sm:text-sm lg:text-base">No data to display</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 justify-items-stretch">
        {/* Completion Pie Chart */}
        <div className="bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold">Task Completion</h3>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {completionRate}%
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Tasks']}
                  labelStyle={{ color: '#374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3">
            {completionData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs sm:text-sm text-gray-600">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-4">Priority Distribution</h3>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 8, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 8, fill: '#6b7280' }}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Tasks']}
                  labelStyle={{ color: '#374151', fontSize: '12px' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[2, 2, 0, 0]}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3">
            {priorityData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs sm:text-sm text-gray-600">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="sm:col-span-2 xl:col-span-1 bg-white p-4 lg:p-6 rounded-lg border shadow-sm flex flex-col h-full">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-4">Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-3 lg:gap-4 flex-1">
            <div className="text-center flex flex-col justify-center">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-blue-600">{actionItems.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center flex flex-col justify-center">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs sm:text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center flex flex-col justify-center">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs sm:text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center flex flex-col justify-center">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-red-600">
                {actionItems.filter(item => item.priority === 'HIGH').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">High Priority</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}