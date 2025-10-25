import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getDashboardData } from '@/lib/actions'
import { TranscriptForm } from '@/components/transcript-form'
import { TaskList } from '@/components/task-list'
import { ProgressChartsWrapper } from '@/components/progress-charts-wrapper'
import { ManualActionForm } from '@/components/manual-action-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/signout-button'
import { Plus, BarChart3, FileText, CheckSquare } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const dashboardData = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">InsightBoard AI</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session.user?.name || session.user?.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Progress Analytics - Single, Responsive Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Progress Analytics</h2>
              <p className="text-sm lg:text-base text-gray-600">Visualize completion rates and priority distribution</p>
            </div>
          </div>
          <ProgressChartsWrapper actionItems={dashboardData.actionItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Transcript Submission */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Submit Meeting Transcript</CardTitle>
                <CardDescription>Paste your meeting transcript to analyze and generate action items</CardDescription>
              </CardHeader>
              <CardContent>
                <TranscriptForm />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Manual Action Creation */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="bg-indigo-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Create Manual Action</CardTitle>
                <CardDescription>Add custom tasks without a transcript</CardDescription>
              </CardHeader>
              <CardContent>
                <ManualActionForm />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Items - Full Width */}
        <div className="mt-6 lg:mt-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="bg-green-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>Track, update, and manage your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList actionItems={dashboardData.actionItems} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}