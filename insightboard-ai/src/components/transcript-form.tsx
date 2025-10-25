'use client'

import { useState, useRef } from 'react'
import { submitTranscript } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Loader2, Upload, Sparkles, FileText, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { ShimmerLoader } from '@/components/shimmer-loader'

export function TranscriptForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a text file (.txt) or document with text content.",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setUploadedFile(file)

    try {
      const content = await file.text()
      setFileContent(content)
      
      // Auto-fill the textarea with file content
      const textarea = document.getElementById('content') as HTMLTextAreaElement
      if (textarea) {
        textarea.value = content
      }

      toast({
        title: "File uploaded successfully",
        description: `Loaded ${file.name} (${Math.round(file.size / 1024)}KB)`,
      })
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Could not read the file content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setFileContent('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (textarea) {
      textarea.value = ''
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setIsAnalyzing(true)
    
    try {
      const result = await submitTranscript(formData)
      
      if (result.success) {
        // Get the actual count from the result
        const actionItemsCount = result.actionItems?.length || 0
        
        toast({
          title: "🎉 Analysis Complete!",
          description: `Successfully analyzed transcript and generated ${actionItemsCount} action item${actionItemsCount !== 1 ? 's' : ''}.`,
        })
        
        // Reset form
        const form = document.getElementById('transcript-form') as HTMLFormElement
        form?.reset()
        setUploadedFile(null)
        setFileContent('')
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to process transcript",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="relative">
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium text-gray-900">Analyzing transcript...</p>
            <p className="text-sm text-gray-600">This may take a few moments</p>
          </div>
        </div>
      )}
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

      {/* File Upload Section */}
      <div className="space-y-2">
        <Label>Upload Transcript File (Optional)</Label>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.text"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Choose File</span>
          </Button>
          {uploadedFile && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <FileText className="h-4 w-4" />
              <span>{uploadedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Upload a .txt file or paste content below. Max file size: 5MB
        </p>
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
    </div>
  )
}