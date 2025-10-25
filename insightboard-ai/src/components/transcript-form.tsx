'use client'

import { useState } from 'react'
import { submitTranscript } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Loader2, Upload, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export function TranscriptForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    
    try {
      const result = await submitTranscript(formData)
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Transcript analyzed and action items generated.",
        })
        
        // Reset form
        const form = document.getElementById('transcript-form') as HTMLFormElement
        form?.reset()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process transcript",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id="transcript-form" action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Meeting Title (Optional)</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Weekly Team Standup - March 15"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Transcript Content *</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Paste your meeting transcript here... The AI will analyze it and extract actionable items automatically."
          className="min-h-[200px] resize-none"
          required
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500">
          Tip: Include speaker names and clear action items for better AI analysis.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>AI will extract action items, priorities, and team tags</span>
        </div>
        
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>

      {/* Sample transcript for demo */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-blue-900">Sample Transcript</h4>
          <p className="text-xs text-blue-700">
            Try this sample to see how the AI analysis works:
          </p>
          <div className="text-xs text-blue-800 bg-white p-3 rounded border">
            <strong>John:</strong> We need to finalize the marketing campaign by Friday. Sarah, can you handle the social media assets?<br/>
            <strong>Sarah:</strong> Absolutely. I'll have the designs ready by Wednesday for review.<br/>
            <strong>Mike:</strong> I'll coordinate with the development team to ensure the landing page is ready. We should also schedule a follow-up meeting to review the analytics.<br/>
            <strong>John:</strong> Great. Let's also make sure we have the budget approval from finance before we launch.
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const titleInput = document.getElementById('title') as HTMLInputElement
              const contentTextarea = document.getElementById('content') as HTMLTextAreaElement
              
              titleInput.value = "Marketing Campaign Planning - March 2024"
              contentTextarea.value = `John: We need to finalize the marketing campaign by Friday. Sarah, can you handle the social media assets?

Sarah: Absolutely. I'll have the designs ready by Wednesday for review.

Mike: I'll coordinate with the development team to ensure the landing page is ready. We should also schedule a follow-up meeting to review the analytics.

John: Great. Let's also make sure we have the budget approval from finance before we launch.`
            }}
            disabled={isLoading}
          >
            Use Sample
          </Button>
        </div>
      </Card>
    </form>
  )
}