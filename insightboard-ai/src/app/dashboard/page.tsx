import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getDashboardData } from '@/lib/actions'
import { TranscriptForm } from '@/components/transcript-form'
import { TaskList } from '@/components/task-list'
import { ProgressCharts } from '@/components/progress-charts'
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Charts */}
        <div className="mb-8">
          <ProgressCharts actionItems={dashboardData.actionItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms and Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Transcript Submission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Submit Meeting Transcript</span>
                </CardTitle>
                <CardDescription>
                  Upload your meeting transcript and let AI extract actionable items automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TranscriptForm />
              </CardContent>
            </Card>

            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Task Analytics</span>
                </CardTitle>
                <CardDescription>
                  Visual overview of your task completion and priority distribution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  <p>Charts will be displayed here once you have action items.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tasks and Recent Activity */}
          <div className="space-y-8">
            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5" />
                    <span>Action Items</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your extracted action items and track progress.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ManualActionForm />
                <TaskList actionItems={dashboardData.actionItems} />
              </CardContent>
            </Card>

            {/* Recent Transcripts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transcripts</CardTitle>
                <CardDescription>
                  Your recently analyzed meeting transcripts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-center text-gray-500 py-8">
                  <p>Recent transcripts will be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}