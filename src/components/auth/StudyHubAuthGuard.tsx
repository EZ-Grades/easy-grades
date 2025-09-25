import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Lock, BookOpen, Brain, Award, Sparkles } from 'lucide-react'
import { GlassCard } from '../GlassCard'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'

interface StudyHubAuthGuardProps {
  children: React.ReactNode
  onAuthRequired: () => void
}

export function StudyHubAuthGuard({ children, onAuthRequired }: StudyHubAuthGuardProps) {
  const { user } = useAuth()
  const [showPreview, setShowPreview] = useState(false)

  if (user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen pb-8 px-4 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient-primary">StudyHub</span> 📚
          </h1>
          <p className="text-lg text-muted-foreground">Your personalized learning command center</p>
        </motion.div>

        {/* Auth Required Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <GlassCard size="lg" className="text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4">
                <BookOpen className="w-12 h-12" />
              </div>
              <div className="absolute top-8 right-8">
                <Brain className="w-16 h-16" />
              </div>
              <div className="absolute bottom-6 left-8">
                <Award className="w-10 h-10" />
              </div>
              <div className="absolute bottom-4 right-4">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>

            <div className="relative z-10 p-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-solid to-secondary-solid rounded-full flex items-center justify-center"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-4 text-gradient-primary">
                Unlock Your Study Potential
              </h2>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Access personalized study plans, interactive quizzes, AI-powered assistance, 
                certification tracking, and progress analytics. Join thousands of students achieving their goals with data-driven insights.
              </p>
              
              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
                <div className="flex items-center gap-2 p-2 rounded bg-primary-solid/10">
                  <Brain className="w-4 h-4 text-primary-solid" />
                  <span>AI Study Assistant</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-secondary-solid/10">
                  <Award className="w-4 h-4 text-secondary-solid" />
                  <span>Certification Tracking</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-highlight-solid/10">
                  <BookOpen className="w-4 h-4 text-highlight-solid" />
                  <span>Smart Flashcards</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-primary-solid/10">
                  <Sparkles className="w-4 h-4 text-primary-solid" />
                  <span>Progress Analytics</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={onAuthRequired}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Get Started with StudyHub
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full"
                >
                  {showPreview ? 'Hide Preview' : 'Preview Features'}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Feature Preview */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature Cards */}
                {[
                  {
                    icon: Brain,
                    title: 'AI Study Assistant',
                    description: 'Get personalized help with any subject using our advanced AI helper.',
                    gradient: 'primary'
                  },
                  {
                    icon: Award,
                    title: 'Certifications',
                    description: 'Earn certificates as you complete courses and demonstrate mastery.',
                    gradient: 'secondary'
                  },
                  {
                    icon: BookOpen,
                    title: 'Smart Revision',
                    description: 'Adaptive revision system that focuses on your weak areas.',
                    gradient: 'highlight'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard className="h-full relative group">
                      {/* Blur overlay */}
                      <div className="absolute inset-0 backdrop-blur-sm bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      
                      <div className="p-6 filter blur-[1px] group-hover:blur-[2px] transition-all duration-300">
                        <feature.icon className={`w-12 h-12 mb-4 text-${feature.gradient}-solid`} />
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}