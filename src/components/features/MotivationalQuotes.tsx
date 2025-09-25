import React, { useState, useEffect } from 'react'
import { Quote, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"

const MOTIVATIONAL_QUOTES = [
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
  },
  {
    text: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci"
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The future belongs to those who prepare for it today.",
    author: "Malcolm X"
  },
  {
    text: "Excellence is not a skill, it's an attitude.",
    author: "Ralph Marston"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown"
  },
  {
    text: "Push yourself, because no one else is going to do it for you.",
    author: "Unknown"
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown"
  },
  {
    text: "Dream it. Wish it. Do it.",
    author: "Unknown"
  },
  {
    text: "Success doesn't just find you. You have to go out and get it.",
    author: "Unknown"
  },
  {
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown"
  },
  {
    text: "Dream bigger. Do bigger.",
    author: "Unknown"
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    author: "Unknown"
  },
  {
    text: "Study hard, for the well is deep, and our brains are shallow.",
    author: "Richard Baxter"
  },
  {
    text: "Learning is a treasure that will follow its owner everywhere.",
    author: "Chinese Proverb"
  },
  {
    text: "The roots of education are bitter, but the fruit is sweet.",
    author: "Aristotle"
  },
  {
    text: "Education is not preparation for life; education is life itself.",
    author: "John Dewey"
  },
  {
    text: "Knowledge is power. Information is liberating.",
    author: "Kofi Annan"
  },
  {
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss"
  }
]

export function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Change quote daily
  useEffect(() => {
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem('quoteDate')
    const savedQuoteIndex = localStorage.getItem('quoteIndex')

    if (savedDate !== today || !savedQuoteIndex) {
      // New day or no saved quote - get a new one
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      setCurrentQuote(MOTIVATIONAL_QUOTES[randomIndex])
      localStorage.setItem('quoteDate', today)
      localStorage.setItem('quoteIndex', randomIndex.toString())
    } else {
      // Use saved quote for today
      const index = parseInt(savedQuoteIndex)
      setCurrentQuote(MOTIVATIONAL_QUOTES[index])
    }
  }, [])

  const refreshQuote = () => {
    setIsRefreshing(true)
    
    setTimeout(() => {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      } while (newIndex === MOTIVATIONAL_QUOTES.indexOf(currentQuote))
      
      setCurrentQuote(MOTIVATIONAL_QUOTES[newIndex])
      
      // Update localStorage with new quote
      const today = new Date().toDateString()
      localStorage.setItem('quoteDate', today)
      localStorage.setItem('quoteIndex', newIndex.toString())
      
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <Card className="glassmorphism border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Daily Inspiration
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshQuote}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <blockquote className="text-lg italic leading-relaxed">
            "{currentQuote.text}"
          </blockquote>
          <cite className="block text-right text-sm text-muted-foreground">
            — {currentQuote.author}
          </cite>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 <strong>Today's Focus:</strong> Remember that every small step forward is progress. 
            You're building habits that will serve you for a lifetime!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}