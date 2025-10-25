'use client'

import { useState } from 'react'
import { toggleTaskStatus, deleteTask, updateTaskPriority } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Calendar, Tag, CheckSquare, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActionItem {
  id: string
  text: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  tags: string[]
  createdAt: Date
  completedAt: Date | null
  transcript: {
    title: string | null
  } | null
}

interface TaskListProps {
  actionItems: ActionItem[]
}

export function TaskList({ actionItems }: TaskListProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL')
  const [sortBy, setSortBy] = useState<'created' | 'priority'>('created')
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set())

  const filteredItems = actionItems.filter(item => {
    if (filter === 'ALL') return true
    return item.status === filter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  async function handleToggleStatus(taskId: string) {
    setUpdatingTasks(prev => new Set(prev).add(taskId))
    try {
      await toggleTaskStatus(taskId)
    } catch (error) {
      console.error('Failed to toggle task status:', error)
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  async function handlePriorityChange(taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') {
    try {
      await updateTaskPriority(taskId, priority)
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  if (actionItems.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No action items yet</h3>
        <p className="text-sm">Submit a meeting transcript to generate action items automatically.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Sorting */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Select value={filter} onValueChange={(value: 'ALL' | 'PENDING' | 'COMPLETED') => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tasks</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'created' | 'priority') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Recent</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">
          {sortedItems.length} of {actionItems.length} tasks
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 border rounded-lg transition-colors ${
              item.status === 'COMPLETED' 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <Checkbox
                  checked={item.status === 'COMPLETED'}
                  onCheckedChange={() => handleToggleStatus(item.id)}
                  disabled={updatingTasks.has(item.id)}
                  className="mt-1"
                />
                {updatingTasks.has(item.id) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${
                  item.status === 'COMPLETED' 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-900'
                }`}>
                  {item.text}
                </p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Select
                    value={item.priority}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
                      handlePriorityChange(item.id, value)
                    }
                    disabled={item.status === 'COMPLETED'}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {item.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3 text-gray-400" />
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{item.tags.length - 2}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span suppressHydrationWarning>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                {item.transcript?.title && (
                  <p className="text-xs text-gray-500 mt-1">
                    From: {item.transcript.title}
                  </p>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteTask(item.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}