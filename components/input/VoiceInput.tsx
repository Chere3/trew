'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Square } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export interface VoiceInputProps {
  onTranscript?: (text: string) => void
  onStart?: () => void
  onStop?: () => void
  onError?: (error: Error) => void
  className?: string
  disabled?: boolean
  language?: string
}

export function VoiceInput({
  onTranscript,
  onStart,
  onStop,
  onError,
  className,
  disabled = false,
  language = 'en-US',
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      onError?.(new Error('Speech recognition not supported'))
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      const fullTranscript = finalTranscript || interimTranscript
      setTranscript(fullTranscript)
      onTranscript?.(fullTranscript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError?.(new Error(event.error))
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      onStop?.()
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language, onTranscript, onStop, onError])

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      onStop?.()
    } else {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
        setTranscript('')
        onStart?.()
      } catch (error) {
        onError?.(error as Error)
      }
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        type="button"
        variant={isRecording ? 'destructive' : 'outline'}
        size="icon"
        onClick={handleToggleRecording}
        disabled={disabled}
        className={cn(
          'h-10 w-10',
          isRecording && 'animate-pulse'
        )}
      >
        {isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      {transcript && (
        <div className="flex-1 text-sm text-muted-foreground">
          {transcript}
        </div>
      )}
    </div>
  )
}
