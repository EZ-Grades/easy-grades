import { motion } from 'motion/react';
import { 
  Heart, 
  Globe, 
  Leaf, 
  Users, 
  Timer, 
  Gamepad2,
  BookOpen,
  Target,
  Mountain,
  TreePine,
  Lightbulb,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import  Logo  from '../../assets/Logo.png';

export function AboutUs() {
  const features = [
    {
      icon: Timer,
      title: 'Study Timers',
      description: 'Focus sessions and Pomodoro timers to keep you on track',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Gamepad2,
      title: 'Focus Games',
      description: 'Fun mini-games and brain teasers to help you stay sharp',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Users,
      title: 'Study Together',
      description: 'Connect with students studying the same subjects worldwide',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BookOpen,
      title: 'Study Resources',
      description: 'Comprehensive tools to enhance your learning experience',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const impactAreas = [
    {
      icon: Leaf,
      title: 'Climate Action',
      description: 'Supporting renewable energy and sustainable farming practices',
      gradient: 'from-green-400 to-emerald-600'
    },
    {
      icon: Mountain,
      title: 'Rural Development',
      description: 'Building infrastructure and educational facilities in remote villages',
      gradient: 'from-blue-400 to-indigo-600'
    },
    {
      icon: TreePine,
      title: 'Environmental Protection',
      description: 'Reforestation projects and biodiversity conservation efforts',
      gradient: 'from-emerald-400 to-green-600'
    },
    {
      icon: Lightbulb,
      title: 'Sustainable Innovation',
      description: 'Clean technology and eco-friendly development solutions',
      gradient: 'from-yellow-400 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen pb-8 px-6 pt-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div className="mb-8">
                      <img
                        src={Logo}
                        alt="App Logo"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 shadow-md"
                      />
                        </div>
            </motion.div>
            <h1 className="text-5xl font-bold text-gradient-primary">About EZ Grades</h1>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <p className="text-xl leading-relaxed text-foreground">
              This is a simple tool made to help students stay productive. You'll find timers, fun little games 
              to help you focus, and ways to connect with others studying the same subject.
            </p>
            
            <div className="flex items-center justify-center gap-3 my-8">
              <div className="h-px bg-gradient-to-r from-transparent via-primary-solid to-transparent flex-1 max-w-32"></div>
              <Heart className="w-6 h-6 text-red-500 animate-pulse" />
              <div className="h-px bg-gradient-to-r from-transparent via-primary-solid to-transparent flex-1 max-w-32"></div>
            </div>
            
            <p className="text-xl leading-relaxed text-foreground">
              But the best part? <span className="text-gradient-primary font-semibold">EZ Grades isn't just for students—it's for the planet.</span> 
              All the money we raise goes to support sustainable development and fight climate change, 
              especially in villages in Nepal. We want to help people there get the support they need, 
              and spread awareness about protecting our environment.
            </p>
          </motion.div>
        </motion.div>

        {/* What We Offer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient-secondary mb-4">What We Offer</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, effective tools to help you stay focused and productive in your studies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="glass-card border-0 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4 glow-primary`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Impact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-green-500" />
              <h2 className="text-3xl font-bold text-gradient-highlight">Our Impact in Nepal</h2>
            </div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Every subscription and donation helps fund sustainable development projects in Nepalese villages, 
              creating lasting positive change for communities and the environment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {impactAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="glass-card border-0 h-full overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-2 bg-gradient-to-r ${area.gradient}`}></div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${area.gradient} flex items-center justify-center`}>
                          <area.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">{area.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{area.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass-card border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-1 bg-gradient-to-r from-primary-solid via-secondary-solid to-highlight-solid"></div>
              <div className="p-8 text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1] 
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="flex items-center justify-center gap-3 mb-6"
                >
                  <Target className="w-8 h-8 text-primary-solid" />
                  <h2 className="text-3xl font-bold text-gradient-primary">Our Mission</h2>
                  <Zap className="w-8 h-8 text-highlight-solid" />
                </motion.div>
                
                <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto mb-8">
                  We believe in the power of education to change lives and the responsibility we have to 
                  protect our planet. By helping students succeed academically, we're also helping 
                  communities in Nepal build a more sustainable future.
                </p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 }}
                  className="inline-block"
                >
                  <Badge 
                    className="px-6 py-3 text-lg gradient-primary text-white glow-primary"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Together, we can make a difference
                  </Badge>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center space-y-6"
        >
          <h3 className="text-2xl font-semibold text-gradient-secondary">
            Ready to Make an Impact?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start your study journey with EZ Grades and know that every session contributes 
            to building a better world for communities in Nepal and our planet.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Making a difference, one study session at a time</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}