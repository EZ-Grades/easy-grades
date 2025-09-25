import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Users, 
  Award,
  ChevronRight,
  Filter,
  Search,
  TrendingUp
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { LuxuryButton } from '../LuxuryButton';
import { LuxuryBadge } from '../LuxuryBadge';
import { ProgressRing } from '../ProgressRing';

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  progress: number;
  rating: number;
  students: number;
  thumbnail: string;
  description: string;
  lessons: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
  timeLimit: number;
  difficulty: string;
  category: string;
  completed: boolean;
  score?: number;
}

export function Courses() {
  const [activeTab, setActiveTab] = useState<'courses' | 'quizzes' | 'certificates'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const courses: Course[] = [
    {
      id: '1',
      title: 'Advanced JavaScript Concepts',
      instructor: 'Dr. Sarah Chen',
      category: 'Programming',
      difficulty: 'advanced',
      duration: '8 hours',
      progress: 65,
      rating: 4.8,
      students: 12453,
      thumbnail: '💻',
      description: 'Master advanced JavaScript concepts including closures, prototypes, and async programming.',
      lessons: 24
    },
    {
      id: '2',
      title: 'Data Structures & Algorithms',
      instructor: 'Prof. Michael Johnson',
      category: 'Computer Science',
      difficulty: 'intermediate',
      duration: '12 hours',
      progress: 30,
      rating: 4.9,
      students: 8976,
      thumbnail: '📊',
      description: 'Learn fundamental data structures and algorithms for efficient problem solving.',
      lessons: 36
    },
    {
      id: '3',
      title: 'Machine Learning Fundamentals',
      instructor: 'Dr. Emily Rodriguez',
      category: 'AI/ML',
      difficulty: 'beginner',
      duration: '15 hours',
      progress: 90,
      rating: 4.7,
      students: 15432,
      thumbnail: '🤖',
      description: 'Introduction to machine learning concepts, algorithms, and practical applications.',
      lessons: 42
    },
    {
      id: '4',
      title: 'Modern Web Design',
      instructor: 'Alex Thompson',
      category: 'Design',
      difficulty: 'intermediate',
      duration: '10 hours',
      progress: 0,
      rating: 4.6,
      students: 9876,
      thumbnail: '🎨',
      description: 'Learn modern web design principles, UI/UX best practices, and design systems.',
      lessons: 28
    }
  ];

  const quizzes: Quiz[] = [
    {
      id: '1',
      title: 'JavaScript ES6+ Features',
      questions: 25,
      timeLimit: 30,
      difficulty: 'Intermediate',
      category: 'Programming',
      completed: true,
      score: 88
    },
    {
      id: '2',
      title: 'React Hooks Deep Dive',
      questions: 20,
      timeLimit: 25,
      difficulty: 'Advanced',
      category: 'Programming',
      completed: false
    },
    {
      id: '3',
      title: 'CSS Grid & Flexbox',
      questions: 15,
      timeLimit: 20,
      difficulty: 'Beginner',
      category: 'Design',
      completed: true,
      score: 92
    },
    {
      id: '4',
      title: 'Python Data Analysis',
      questions: 30,
      timeLimit: 45,
      difficulty: 'Intermediate',
      category: 'Data Science',
      completed: false
    }
  ];

  const certificates = [
    {
      id: '1',
      title: 'Full Stack Web Development',
      issuer: 'TechAcademy',
      completedDate: '2024-01-15',
      validity: 'Lifetime',
      skills: ['React', 'Node.js', 'MongoDB', 'Express.js']
    },
    {
      id: '2',
      title: 'Advanced JavaScript Programming',
      issuer: 'CodeMaster Institute',
      completedDate: '2023-12-10',
      validity: '2 years',
      skills: ['ES6+', 'Async Programming', 'Design Patterns']
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      issuer: 'Design Academy',
      completedDate: '2023-11-22',
      validity: 'Lifetime',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems']
    }
  ];

  const categories = ['all', 'Programming', 'Design', 'Data Science', 'AI/ML', 'Computer Science'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'secondary';
      case 'intermediate': return 'highlight';
      case 'advanced': return 'error';
      default: return 'primary';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <span className="text-gradient-highlight">Learning Hub</span> 📚
          </h1>
          <p className="text-lg text-muted-foreground">Expand your knowledge with expert-led courses</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-2 flex gap-2">
            {[
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'quizzes', label: 'Quizzes', icon: Play },
              { id: 'certificates', label: 'Certificates', icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
                    ${activeTab === tab.id
                      ? 'gradient-primary text-white shadow-lg'
                      : 'hover:bg-white/10 text-foreground/80 hover:text-foreground'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg glass-card border-none focus:glow-primary transition-all duration-300"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-lg glass-card border-none focus:glow-primary transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="h-full" gradient="primary">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-2xl">
                        {course.thumbnail}
                      </div>
                      <LuxuryBadge 
                        variant={getDifficultyColor(course.difficulty) as any}
                        size="sm"
                      >
                        {course.difficulty}
                      </LuxuryBadge>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">by {course.instructor}</p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.lessons} lessons
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ({course.students.toLocaleString()} students)
                      </div>
                    </div>

                    {course.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            className="gradient-primary h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    )}

                    <LuxuryButton
                      variant={course.progress > 0 ? 'secondary' : 'primary'}
                      fullWidth
                      icon={course.progress > 0 ? <Play className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    >
                      {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                    </LuxuryButton>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard gradient="secondary">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">{quiz.title}</h3>
                    <LuxuryBadge 
                      variant={quiz.completed ? 'secondary' : 'highlight'}
                      size="sm"
                    >
                      {quiz.completed ? 'Completed' : 'Available'}
                    </LuxuryBadge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{quiz.questions}</div>
                      <div className="text-muted-foreground">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{quiz.timeLimit}m</div>
                      <div className="text-muted-foreground">Time Limit</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{quiz.difficulty}</div>
                      <div className="text-muted-foreground">Difficulty</div>
                    </div>
                  </div>

                  {quiz.completed && quiz.score && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Your Score
                        </span>
                        <span className="text-lg font-bold text-green-700 dark:text-green-300">
                          {quiz.score}%
                        </span>
                      </div>
                    </div>
                  )}

                  <LuxuryButton
                    variant={quiz.completed ? 'outline' : 'secondary'}
                    fullWidth
                    icon={<Play className="w-4 h-4" />}
                  >
                    {quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
                  </LuxuryButton>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard gradient="highlight" className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-highlight flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Issued by {cert.issuer}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed:</span>
                      <span>{new Date(cert.completedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valid:</span>
                      <span>{cert.validity}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {cert.skills.map((skill, skillIndex) => (
                      <LuxuryBadge key={skillIndex} variant="highlight" size="sm">
                        {skill}
                      </LuxuryBadge>
                    ))}
                  </div>

                  <LuxuryButton variant="highlight" size="sm" fullWidth>
                    View Certificate
                  </LuxuryButton>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}