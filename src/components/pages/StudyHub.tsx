import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  BookOpen, 
  Search, 
  Filter, 
  Play, 
  Code, 
  Database, 
  Shield, 
  Cloud, 
  Smartphone, 
  Globe,
  Trophy,
  Target,
  Clock,
  Star,
  CheckCircle,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Heart,
  Stethoscope,
  Calculator,
  Brain,
  Languages,
  BarChart3,
  Building,
  Users,
  Bot,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { toast } from 'sonner@2.0.3';
import { AIStudyHelper } from '../AIStudyHelper';

interface StudyHubProps {
  user?: any;
}

interface Certification {
  id: string;
  name: string;
  provider: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  questions: number;
  category: string;
  logo?: string;
}

interface Question {
  id: string;
  question: string;
  options: { [key: string]: string };
  correct: string;
  explanation: string;
  difficulty: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  progress: number;
  category: string;
}

export function StudyHub({ user }: StudyHubProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [revisionMode, setRevisionMode] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);

  const categories = [
    { id: 'it', name: 'IT & Technology', icon: Code, color: 'from-blue-500 to-cyan-500', certifications: [
      { id: 'comptia-a', name: 'CompTIA A+', provider: 'CompTIA', description: 'Entry-level IT certification', difficulty: 'Beginner' as const, duration: '90 min', questions: 90, category: 'it' },
      { id: 'network-plus', name: 'Network+', provider: 'CompTIA', description: 'Networking fundamentals', difficulty: 'Intermediate' as const, duration: '90 min', questions: 90, category: 'it' },
      { id: 'security-plus', name: 'Security+', provider: 'CompTIA', description: 'Cybersecurity basics', difficulty: 'Intermediate' as const, duration: '90 min', questions: 90, category: 'it' },
      { id: 'ccna', name: 'CCNA', provider: 'Cisco', description: 'Cisco networking certification', difficulty: 'Intermediate' as const, duration: '120 min', questions: 120, category: 'it' },
      { id: 'azure-fundamentals', name: 'Azure Fundamentals', provider: 'Microsoft', description: 'Cloud computing basics', difficulty: 'Beginner' as const, duration: '85 min', questions: 85, category: 'it' },
      { id: 'aws-saa', name: 'AWS Solutions Architect', provider: 'AWS', description: 'Cloud architecture design', difficulty: 'Advanced' as const, duration: '130 min', questions: 65, category: 'it' },
      { id: 'gcp-ace', name: 'Google Cloud Associate', provider: 'Google Cloud', description: 'Cloud engineering', difficulty: 'Intermediate' as const, duration: '120 min', questions: 50, category: 'it' },
      { id: 'ceh', name: 'CEH', provider: 'EC-Council', description: 'Ethical hacking', difficulty: 'Advanced' as const, duration: '240 min', questions: 125, category: 'it' },
      { id: 'cissp', name: 'CISSP', provider: 'ISC2', description: 'Information security', difficulty: 'Advanced' as const, duration: '180 min', questions: 125, category: 'it' },
      { id: 'vcp', name: 'VCP', provider: 'VMware', description: 'Virtualization', difficulty: 'Intermediate' as const, duration: '135 min', questions: 70, category: 'it' }
    ]},
    { id: 'business', name: 'Business & Management', icon: Briefcase, color: 'from-purple-500 to-violet-500', certifications: [
      { id: 'pmp', name: 'PMP', provider: 'PMI', description: 'Project management professional', difficulty: 'Advanced' as const, duration: '230 min', questions: 180, category: 'business' },
      { id: 'capm', name: 'CAPM', provider: 'PMI', description: 'Certified Associate in Project Management', difficulty: 'Beginner' as const, duration: '150 min', questions: 150, category: 'business' },
      { id: 'prince2', name: 'PRINCE2', provider: 'Axelos', description: 'Project management methodology', difficulty: 'Intermediate' as const, duration: '75 min', questions: 75, category: 'business' },
      { id: 'csm', name: 'Certified Scrum Master', provider: 'Scrum Alliance', description: 'Agile methodology', difficulty: 'Intermediate' as const, duration: '60 min', questions: 50, category: 'business' },
      { id: 'safe-agilist', name: 'SAFe Agilist', provider: 'Scaled Agile', description: 'Scaled agile framework', difficulty: 'Intermediate' as const, duration: '90 min', questions: 45, category: 'business' },
      { id: 'cfa', name: 'CFA', provider: 'CFA Institute', description: 'Chartered Financial Analyst', difficulty: 'Advanced' as const, duration: '270 min', questions: 180, category: 'business' },
      { id: 'cpa', name: 'CPA', provider: 'AICPA', description: 'Certified Public Accountant', difficulty: 'Advanced' as const, duration: '240 min', questions: 90, category: 'business' },
      { id: 'acca', name: 'ACCA', provider: 'ACCA', description: 'Association of Chartered Certified Accountants', difficulty: 'Advanced' as const, duration: '180 min', questions: 100, category: 'business' },
      { id: 'cma', name: 'CMA', provider: 'IMA', description: 'Certified Management Accountant', difficulty: 'Advanced' as const, duration: '240 min', questions: 100, category: 'business' }
    ]},
    { id: 'healthcare', name: 'Healthcare & Medical', icon: Heart, color: 'from-red-500 to-pink-500', certifications: [
      { id: 'usmle-step1', name: 'USMLE Step 1', provider: 'NBME', description: 'Medical licensing exam', difficulty: 'Advanced' as const, duration: '480 min', questions: 280, category: 'healthcare' },
      { id: 'plab-part1', name: 'PLAB Part 1', provider: 'GMC', description: 'Professional and Linguistic Assessments Board', difficulty: 'Advanced' as const, duration: '180 min', questions: 180, category: 'healthcare' },
      { id: 'amcmcq', name: 'AMC MCQ', provider: 'AMC', description: 'Australian Medical Council', difficulty: 'Advanced' as const, duration: '210 min', questions: 150, category: 'healthcare' },
      { id: 'nclex-rn', name: 'NCLEX-RN', provider: 'NCSBN', description: 'Nursing licensure exam', difficulty: 'Intermediate' as const, duration: '300 min', questions: 265, category: 'healthcare' },
      { id: 'ancc', name: 'ANCC Certification', provider: 'ANCC', description: 'Nursing specialty certification', difficulty: 'Intermediate' as const, duration: '180 min', questions: 175, category: 'healthcare' },
      { id: 'emt', name: 'EMT', provider: 'NREMT', description: 'Emergency Medical Technician', difficulty: 'Beginner' as const, duration: '120 min', questions: 120, category: 'healthcare' },
      { id: 'paramedic', name: 'Paramedic', provider: 'NREMT', description: 'Advanced emergency medical care', difficulty: 'Advanced' as const, duration: '150 min', questions: 150, category: 'healthcare' },
      { id: 'radiologic-tech', name: 'Radiologic Technologist', provider: 'ARRT', description: 'Medical imaging certification', difficulty: 'Intermediate' as const, duration: '210 min', questions: 200, category: 'healthcare' },
      { id: 'naplex', name: 'NAPLEX', provider: 'NABP', description: 'Pharmacy licensure exam', difficulty: 'Advanced' as const, duration: '390 min', questions: 250, category: 'healthcare' },
      { id: 'fpgee', name: 'FPGEE', provider: 'NABP', description: 'Foreign Pharmacy Graduate Equivalency', difficulty: 'Advanced' as const, duration: '240 min', questions: 200, category: 'healthcare' }
    ]},
    { id: 'language', name: 'Language & Communication', icon: Languages, color: 'from-green-500 to-emerald-500', certifications: [
      { id: 'toefl', name: 'TOEFL', provider: 'ETS', description: 'Test of English as a Foreign Language', difficulty: 'Intermediate' as const, duration: '180 min', questions: 80, category: 'language' },
      { id: 'ielts', name: 'IELTS', provider: 'British Council', description: 'International English Language Testing System', difficulty: 'Intermediate' as const, duration: '165 min', questions: 40, category: 'language' },
      { id: 'sat', name: 'SAT', provider: 'College Board', description: 'Scholastic Assessment Test', difficulty: 'Intermediate' as const, duration: '180 min', questions: 154, category: 'language' },
      { id: 'gre', name: 'GRE', provider: 'ETS', description: 'Graduate Record Examinations', difficulty: 'Advanced' as const, duration: '225 min', questions: 80, category: 'language' }
    ]},
    { id: 'finance', name: 'Finance, Data & Analytics', icon: BarChart3, color: 'from-orange-500 to-amber-500', certifications: [
      { id: 'google-analytics', name: 'Google Data Analytics', provider: 'Google', description: 'Data analysis certification', difficulty: 'Beginner' as const, duration: '120 min', questions: 70, category: 'finance' },
      { id: 'sas-certified', name: 'SAS Certified', provider: 'SAS', description: 'Statistical analysis software', difficulty: 'Intermediate' as const, duration: '180 min', questions: 95, category: 'finance' },
      { id: 'tableau-desktop', name: 'Tableau Desktop', provider: 'Tableau', description: 'Data visualization', difficulty: 'Intermediate' as const, duration: '120 min', questions: 36, category: 'finance' },
      { id: 'power-bi', name: 'Power BI', provider: 'Microsoft', description: 'Business intelligence', difficulty: 'Intermediate' as const, duration: '150 min', questions: 40, category: 'finance' },
      { id: 'frm', name: 'FRM', provider: 'GARP', description: 'Financial Risk Manager', difficulty: 'Advanced' as const, duration: '240 min', questions: 100, category: 'finance' },
      { id: 'cmt', name: 'CMT', provider: 'CMT Association', description: 'Chartered Market Technician', difficulty: 'Advanced' as const, duration: '180 min', questions: 120, category: 'finance' }
    ]}
  ];

  // Sample questions for demo
  const sampleQuestions: Question[] = [
    {
      id: '1',
      question: 'Which layer of the OSI model is responsible for routing packets between networks?',
      options: {
        'A': 'Physical Layer',
        'B': 'Data Link Layer', 
        'C': 'Network Layer',
        'D': 'Transport Layer'
      },
      correct: 'C',
      explanation: 'The Network Layer (Layer 3) is responsible for routing packets between different networks using logical addressing like IP addresses.',
      difficulty: 'medium'
    },
    {
      id: '2',
      question: 'What is the primary purpose of a firewall in network security?',
      options: {
        'A': 'To encrypt data transmission',
        'B': 'To filter network traffic based on security rules',
        'C': 'To provide wireless connectivity',
        'D': 'To store network configurations'
      },
      correct: 'B',
      explanation: 'A firewall filters incoming and outgoing network traffic based on predetermined security rules to protect networks from unauthorized access.',
      difficulty: 'easy'
    },
    {
      id: '3',
      question: 'In project management, what does the acronym "WBS" stand for?',
      options: {
        'A': 'Work Breakdown Structure',
        'B': 'Weekly Business Summary',
        'C': 'Web-Based System',
        'D': 'Workflow Business Standard'
      },
      correct: 'A',
      explanation: 'Work Breakdown Structure (WBS) is a hierarchical decomposition of the total scope of work to be carried out by the project team.',
      difficulty: 'easy'
    },
    {
      id: '4',
      question: 'Which AWS service is primarily used for content delivery and caching?',
      options: {
        'A': 'EC2',
        'B': 'S3',
        'C': 'CloudFront',
        'D': 'RDS'
      },
      correct: 'C',
      explanation: 'Amazon CloudFront is a content delivery network (CDN) service that delivers data, videos, applications, and APIs to customers globally with low latency and high transfer speeds.',
      difficulty: 'medium'
    },
    {
      id: '5',
      question: 'In medical terminology, what does the prefix "hyper-" mean?',
      options: {
        'A': 'Below normal',
        'B': 'Above normal',
        'C': 'Within normal',
        'D': 'Around normal'
      },
      correct: 'B',
      explanation: 'The prefix "hyper-" means above, excessive, or beyond normal. For example, hypertension means high blood pressure.',
      difficulty: 'easy'
    }
  ];

  // Initialize flashcard sets
  useEffect(() => {
    const initialFlashcardSets: FlashcardSet[] = [
      { id: '1', title: 'AWS Cloud Concepts', description: 'Basic cloud computing terms and services', cardCount: 25, progress: 80, category: 'it' },
      { id: '2', title: 'Network Security', description: 'Security protocols and best practices', cardCount: 30, progress: 60, category: 'it' },
      { id: '3', title: 'Project Management Terms', description: 'PMP key terminology and concepts', cardCount: 40, progress: 45, category: 'business' },
      { id: '4', title: 'Medical Terminology', description: 'Common medical terms and definitions', cardCount: 50, progress: 70, category: 'healthcare' },
      { id: '5', title: 'Financial Analysis', description: 'Key financial ratios and concepts', cardCount: 35, progress: 25, category: 'finance' },
      { id: '6', title: 'English Grammar', description: 'Advanced grammar rules for TOEFL/IELTS', cardCount: 45, progress: 90, category: 'language' },
    ];
    setFlashcardSets(initialFlashcardSets);
  }, []);

  const handleStartPractice = (cert: Certification) => {
    setSelectedCert(cert);
    setCurrentQuestions(sampleQuestions.slice(0, 5)); // Load 5 questions for demo
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setPracticeMode(true);
    setSessionStartTime(new Date());
    toast.success(`Started practice session for ${cert.name}`);
  };

  const handleStartRevision = (flashcardSet: FlashcardSet) => {
    setRevisionMode(true);
    toast.success(`Started revision for ${flashcardSet.title}`);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitSession = () => {
    const correct = currentQuestions.reduce((count, question) => {
      return selectedAnswers[question.id] === question.correct ? count + 1 : count;
    }, 0);
    
    const score = Math.round((correct / currentQuestions.length) * 100);
    setShowResults(true);
    toast.success(`Session completed! Score: ${score}%`);
  };

  const handleGenerateFlashcards = (cert: Certification) => {
    // Simulate AI flashcard generation
    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      title: `${cert.name} - AI Generated`,
      description: `Auto-generated flashcards for ${cert.name}`,
      cardCount: 20,
      progress: 0,
      category: cert.category
    };
    setFlashcardSets(prev => [...prev, newSet]);
    toast.success(`Generated ${newSet.cardCount} flashcards for ${cert.name}!`);
  };

  const filteredCertifications = categories.flatMap(cat => 
    cat.certifications.filter(cert => 
      (selectedCategory === 'all' || cert.category === selectedCategory) &&
      (searchQuery === '' || 
       cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       cert.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
       cert.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
      case 'easy':
        return 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30';
      case 'Intermediate':
      case 'medium':
        return 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
      case 'Advanced':
      case 'hard':
        return 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30';
      default:
        return 'border-gray-500 text-gray-600 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  // Practice Session View
  if (practiceMode && selectedCert && currentQuestions.length > 0) {
    return (
      <div className="min-h-screen pb-8 px-6 pt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  {selectedCert.name} Practice Session
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPracticeMode(false)}
                >
                  Exit Session
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
                </div>
                <Progress 
                  value={((currentQuestionIndex + 1) / currentQuestions.length) * 100} 
                  className="w-48 h-2" 
                />
              </div>

              {!showResults ? (
                <>
                  <div className="p-6 bg-muted/30 rounded-xl space-y-4">
                    <h3 className="font-medium text-lg">
                      {currentQuestions[currentQuestionIndex].question}
                    </h3>
                    <Badge className={getDifficultyColor(currentQuestions[currentQuestionIndex].difficulty)}>
                      {currentQuestions[currentQuestionIndex].difficulty}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentQuestions[currentQuestionIndex].options).map(([key, value]) => (
                      <Button
                        key={key}
                        variant="outline"
                        className={`p-4 h-auto text-left justify-start transition-all ${
                          selectedAnswers[currentQuestions[currentQuestionIndex].id] === key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'hover:border-blue-300'
                        }`}
                        onClick={() => handleAnswerSelect(currentQuestions[currentQuestionIndex].id, key)}
                      >
                        <span className="font-semibold mr-3 text-blue-600">{key}.</span>
                        <span className="flex-1">{value}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    
                    {currentQuestionIndex === currentQuestions.length - 1 ? (
                      <Button
                        onClick={handleSubmitSession}
                        className="gradient-primary"
                        disabled={Object.keys(selectedAnswers).length !== currentQuestions.length}
                      >
                        Submit Session
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion}>
                        Next
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className="text-6xl">🎉</div>
                  <h3 className="text-2xl font-bold">Session Complete!</h3>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentQuestions.reduce((count, q) => 
                          selectedAnswers[q.id] === q.correct ? count + 1 : count, 0
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {currentQuestions.length - currentQuestions.reduce((count, q) => 
                          selectedAnswers[q.id] === q.correct ? count + 1 : count, 0
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((currentQuestions.reduce((count, q) => 
                          selectedAnswers[q.id] === q.correct ? count + 1 : count, 0
                        ) / currentQuestions.length) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Score</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setPracticeMode(false)}
                    className="gradient-primary"
                  >
                    Return to Study Hub
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 px-6 pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8 text-primary-solid" />
            <h1 className="text-5xl font-bold text-gradient-primary">Study Hub</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master certifications with comprehensive courses, practice exams, and AI-powered study tools
          </p>
          
          {/* AI Helper Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Button
              onClick={() => setShowAIHelper(true)}
              className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Bot className="w-5 h-5 mr-2" />
              <Sparkles className="w-4 h-4 mr-2" />
              AI Study Helper
            </Button>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search certifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Categories Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Card className={`glassmorphism border-0 text-center transition-all duration-300 ${
                  selectedCategory === category.id ? 'ring-2 ring-primary-solid' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.certifications.length} certs
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Certifications Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === 'all' ? 'All Certifications' : 
               categories.find(c => c.id === selectedCategory)?.name || 'Certifications'}
            </h2>
            <div className="text-sm text-muted-foreground">
              {filteredCertifications.length} certifications found
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="glassmorphism border-0 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{cert.name}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {cert.provider}
                          </Badge>
                          <Badge className={getDifficultyColor(cert.difficulty)}>
                            {cert.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{cert.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{cert.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span>{cert.questions} questions</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleStartPractice(cert)}
                        className="w-full gradient-primary"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Practice
                      </Button>
                      <Button
                        onClick={() => handleGenerateFlashcards(cert)}
                        variant="outline"
                        className="w-full"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Generate Flashcards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Flashcard Sets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-secondary-solid" />
            <h2 className="text-2xl font-bold text-gradient-secondary">Flashcard Sets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {flashcardSets.map((set, index) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="glassmorphism border-0 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{set.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{set.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>{set.cardCount} cards</span>
                      <span>{set.progress}% complete</span>
                    </div>
                    <Progress value={set.progress} className="h-2" />
                    <Button
                      onClick={() => handleStartRevision(set)}
                      className="w-full gradient-secondary"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Study Cards
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* AI Study Helper */}
      <AIStudyHelper
        isOpen={showAIHelper}
        onClose={() => setShowAIHelper(false)}
      />
    </div>
  );
}