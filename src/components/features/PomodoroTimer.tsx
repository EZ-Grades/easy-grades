import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from 'sonner@2.0.3'

interface PomodoroTimerProps {
  onSessionComplete?: (duration: number, type: string, completed: boolean) => void
}

type SessionType = 'work' | 'short-break' | 'long-break'

const SESSION_DURATIONS = {
  work: 25 * 60, // 25 minutes
  'short-break': 5 * 60, // 5 minutes
  'long-break': 15 * 60, // 15 minutes
}

const SESSION_LABELS = {
  work: 'Focus Session',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [sessionType, setSessionType] = useState<SessionType>('work')
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATIONS.work)
  const [isRunning, setIsRunning] = useState(false)
  const [customDuration, setCustomDuration] = useState(25)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalDuration = sessionType === 'work' && customDuration !== 25 
    ? customDuration * 60 
    : SESSION_DURATIONS[sessionType]

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleSessionComplete = () => {
    setIsRunning(false)
    
    if (sessionStartTime && onSessionComplete) {
      const durationMinutes = Math.ceil((Date.now() - sessionStartTime.getTime()) / 60000)
      onSessionComplete(durationMinutes, sessionType, true)
    }

    // Play completion sound (browser notification sound)
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Audio notification not supported')
    }

    // Show notification
    if (sessionType === 'work') {
      toast.success('🎉 Focus session completed! Time for a break.')
    } else {
      toast.success('✨ Break time is over! Ready to focus again?')
    }

    // Auto-switch to next session type
    if (sessionType === 'work') {
      setSessionType('short-break')
      setTimeLeft(SESSION_DURATIONS['short-break'])
    } else {
      setSessionType('work')
      setTimeLeft(customDuration * 60)
    }
  }

  const handleStart = () => {
    setIsRunning(true)
    if (!sessionStartTime) {
      setSessionStartTime(new Date())
    }
  }

  const handlePause = () => {
    setIsRunning(false)
    
    // Save partial session if work session
    if (sessionStartTime && sessionType === 'work' && onSessionComplete) {
      const durationMinutes = Math.ceil((Date.now() - sessionStartTime.getTime()) / 60000)
      if (durationMinutes > 0) {
        onSessionComplete(durationMinutes, sessionType, false)
      }
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setSessionStartTime(null)
    
    if (sessionType === 'work' && customDuration !== 25) {
      setTimeLeft(customDuration * 60)
    } else {
      setTimeLeft(SESSION_DURATIONS[sessionType])
    }
  }

  const handleSessionTypeChange = (newType: SessionType) => {
    setIsRunning(false)
    setSessionStartTime(null)
    setSessionType(newType)
    
    if (newType === 'work' && customDuration !== 25) {
      setTimeLeft(customDuration * 60)
    } else {
      setTimeLeft(SESSION_DURATIONS[newType])
    }
  }

  const handleCustomDurationChange = (minutes: string) => {
    const mins = parseInt(minutes)
    setCustomDuration(mins)
    if (sessionType === 'work') {
      setTimeLeft(mins * 60)
      setIsRunning(false)
      setSessionStartTime(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'work': return <Brain className="w-6 h-6" />
      case 'short-break':
      case 'long-break': return <Coffee className="w-6 h-6" />
    }
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work': return 'text-blue-600'
      case 'short-break': return 'text-green-600'
      case 'long-break': return 'text-purple-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Session Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Session Type</label>
        <Select value={sessionType} onValueChange={handleSessionTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="work">Focus Session (25 min)</SelectItem>
            <SelectItem value="short-break">Short Break (5 min)</SelectItem>
            <SelectItem value="long-break">Long Break (15 min)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Duration for Work Sessions */}
      {sessionType === 'work' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Duration (minutes)</label>
          <Select value={customDuration.toString()} onValueChange={handleCustomDurationChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="25">25 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Timer Display */}
      <div className="text-center space-y-4">
        <div className={`flex items-center justify-center gap-2 ${getSessionColor()}`}>
          {getSessionIcon()}
          <h3 className="text-lg font-medium">{SESSION_LABELS[sessionType]}</h3>
        </div>
        
        <div className="relative">
          <div className="text-6xl font-mono font-bold text-center mb-4">
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        {!isRunning ? (
          <Button 
            onClick={handleStart}
            className="flex-1 max-w-32"
            disabled={timeLeft === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button 
            onClick={handlePause}
            variant="outline"
            className="flex-1 max-w-32"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}
        
        <Button 
          onClick={handleReset}
          variant="outline"
          className="flex-1 max-w-32"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Session Info */}
      <div className="text-center text-sm text-muted-foreground">
        {isRunning ? (
          <p>Focus time! Stay productive and avoid distractions.</p>
        ) : timeLeft === 0 ? (
          <p>Session completed! Great work!</p>
        ) : (
          <p>Click start when you're ready to begin your session.</p>
        )}
      </div>
    </div>
  )
}