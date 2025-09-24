import Layout from "@/components/layout/Layout";
import { Icon } from "@iconify/react";
import { Code2, Target, Trophy, Users, Zap, BookOpen } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Icon icon="vscode-icons:file-type-java" className="w-20 h-20" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Icon icon="mdi:star" className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            JavaRanker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master Java programming through interactive challenges, real-time feedback, and comprehensive analytics
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8 border">
            <p className="text-lg text-center leading-relaxed">
              JavaRanker is designed to bridge the gap between theoretical Java knowledge and practical programming skills. 
              We provide an interactive platform where developers can practice, learn, and excel in Java programming through 
              carefully crafted challenges and instant feedback.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose JavaRanker?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Coding</h3>
              <p className="text-muted-foreground">
                Write, test, and debug Java code in our advanced online editor with syntax highlighting and autocomplete
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Targeted Practice</h3>
              <p className="text-muted-foreground">
                Challenges organized by difficulty and topic, from basic syntax to advanced algorithms and data structures
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Comprehensive analytics track your learning journey with detailed performance metrics and skill progression
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Feedback</h3>
              <p className="text-muted-foreground">
                Get immediate results with automated test cases, execution time analysis, and detailed error reporting
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Learning Path</h3>
              <p className="text-muted-foreground">
                Structured curriculum from beginner to advanced levels with clear learning objectives and milestones
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-muted-foreground">
                Join a community of Java enthusiasts, share solutions, and learn from peer discussions and code reviews
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Built With Modern Technology</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon icon="mdi:react" className="w-6 h-6 text-blue-500" />
                Frontend
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• React 18 with TypeScript for type-safe development</li>
                <li>• Tailwind CSS for responsive, modern UI design</li>
                <li>• CodeMirror for advanced code editing experience</li>
                <li>• Vite for fast development and optimized builds</li>
              </ul>
            </div>
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon icon="mdi:server" className="w-6 h-6 text-green-500" />
                Backend
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Node.js with Express for robust API development</li>
                <li>• MySQL database for reliable data persistence</li>
                <li>• Docker containers for consistent code execution</li>
                <li>• RESTful APIs for seamless client-server communication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Platform Statistics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Coding Challenges</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-green-100">Code Submissions</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-purple-100">Success Rate</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-orange-100">Availability</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Java Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of developers improving their Java skills with JavaRanker
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/challenges" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Coding Now
            </a>
            <a 
              href="/login" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}