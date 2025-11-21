'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, PlayCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  // Datos para las secciones
  const manualSteps = [
    { icon: "💬", text: "Post update in Slack", time: "2 min" },
    { icon: "📊", text: "Update forecast in Google Sheets", time: "3 min" },
    { icon: "📧", text: "Send confirmation email", time: "5 min" },
    { icon: "📅", text: "Schedule follow-up meeting", time: "5 min" }
  ]

  const stats = [
    { 
      number: "35%", 
      label: "of work time is repetitive copy/paste",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      number: "5 hours", 
      label: "wasted monthly per sales rep",
      gradient: "from-pink-500 to-red-500"
    },
    { 
      number: "$9,200", 
      label: "lost annually per team member",
      gradient: "from-red-500 to-orange-500"
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "You Update Once",
      description: "Change a deal in your CRM or any data source",
      icon: "✏️"
    },
    {
      step: "2",
      title: "ECHO Detects",
      description: "Recognizes your workflow pattern and data structure",
      icon: "🔍"
    },
    {
      step: "3",
      title: "watsonx Orchestrates",
      description: "IBM watsonx executes integrations in parallel with retry logic",
      icon: "⚡",
      badge: "Powered by IBM watsonx"
    },
    {
      step: "4",
      title: "Updates Everywhere",
      description: "Slack, Sheets, Email, Calendar—all synced in 3.5 minutes",
      icon: "✅"
    }
  ]

  const features = [
    {
      icon: "🔮",
      title: "Predictive Automation",
      description: "ECHO learns your patterns. After 3 manual syncs, it suggests: 'Automate this flow?' Zapier can't do that.",
      badge: "Smart"
    },
    {
      icon: "⚡",
      title: "Parallel Execution",
      description: "watsonx Orchestrate runs all integrations simultaneously. 15 minutes → 3.5 minutes. 77% faster.",
      badge: "Fast"
    },
    {
      icon: "🛡️",
      title: "Enterprise Ready",
      description: "Automatic retry logic, error handling, and audit logs. Built on IBM watsonx infrastructure.",
      badge: "Reliable"
    },
    {
      icon: "📊",
      title: "Live ROI Tracking",
      description: "See time and money saved in real-time. Dashboard shows: 184h saved, $9,200/year recovered.",
      badge: "Measurable"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo + Badge */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="flex items-center gap-3">
                <Image 
                  src="/Echo_logo.png" 
                  alt="ECHO Logo" 
                  width={48} 
                  height={48}
                  className="transition-transform group-hover:scale-110"
                />
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ECHO
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600 px-2 py-0">
                      Powered by IBM watsonx
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* CTA Button */}
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all">
                Try Dashboard →
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-70" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center space-y-8">
            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Stop Copying. <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Start Automating.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              35% of your workday is shadow work—copying the same data across Slack, 
              Google Sheets, Email, and Calendar. ECHO eliminates it with one click, 
              powered by IBM watsonx Orchestrate.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
                  Try Demo Dashboard →
                </Button>
              </Link>
            </div>

            {/* Promotional Video */}
            <div className="mt-16 max-w-5xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }} />
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="mb-4">
                    <div className="inline-block p-4 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                      <PlayCircle className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Why ECHO Changes Everything</h3>
                  <p className="text-white/90 text-sm mb-4">See the problem ECHO solves—explained simply</p>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 transition-transform">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Watch Now
                  </Button>
                  <p className="text-white/70 text-sm mt-3">2 minutes • No signup required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEMA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-4">
            The Shadow Work Epidemic
          </h2>

          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Every time you update a deal, you manually:
          </p>

          {/* Manual Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {manualSteps.map((step, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.text}</h3>
                <p className="text-sm text-purple-600 font-medium">{step.time}</p>
              </div>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${stat.gradient} p-8 rounded-xl shadow-lg text-white transform transition-transform hover:scale-105`}
              >
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: SOLUCIÓN */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-16">
            The ECHO Way: <span className="text-purple-600">Automate Everything</span>
          </h2>

          {/* How It Works Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 relative">
            {howItWorks.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center relative">
                {/* Número del paso con gradiente */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {step.step}
                </div>
                
                {/* Ícono grande */}
                <div className="text-4xl mb-4">{step.icon}</div>
                
                {/* Título */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                
                {/* Descripción */}
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                
                {/* Badge opcional para watsonx */}
                {step.badge && (
                  <Badge className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
                    {step.badge}
                  </Badge>
                )}
                
                {/* Flecha conectando pasos (solo desktop) */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-purple-300 text-4xl pointer-events-none">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-4">
            Why ECHO Beats Manual Work
          </h2>

          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Not another Zapier. ECHO combines pattern detection with enterprise-grade orchestration.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300">
                {/* Badge en esquina superior */}
                <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
                  {feature.badge}
                </Badge>
                
                {/* Ícono grande */}
                <div className="text-5xl mb-4">{feature.icon}</div>
                
                {/* Título */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                {/* Descripción */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: TECHNICAL DEMO (90s) */}
      <section className="py-16 md:py-24 bg-white border-t-2 border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-blue-600 text-white text-sm px-4 py-2">
              IBM watsonx Orchestrate Hackathon Submission
            </Badge>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-4">
            See ECHO in Action
          </h2>

          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            90-second technical demonstration showing ECHO + watsonx orchestrating real integrations
          </p>

          {/* Video Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gray-900 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden border-2 border-purple-300">
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)',
                  backgroundSize: '50px 50px'
                }} />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="mb-4">
                  <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4">
                    <PlayCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4">
                  Watch Technical Demo
                </Button>
                <p className="text-gray-400 text-sm mt-3">90 seconds • Hackathon submission</p>
              </div>
            </div>
          </div>

          {/* Technical Features Highlight */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Parallel Execution</h3>
              <p className="text-xs text-gray-600">All integrations simultaneously</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="text-2xl mb-2">🔮</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Pattern Detection</h3>
              <p className="text-xs text-gray-600">Learns your workflows</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">watsonx Orchestration</h3>
              <p className="text-xs text-gray-600">IBM enterprise-grade</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Live Metrics</h3>
              <p className="text-xs text-gray-600">Real-time ROI tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA FINAL */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Eliminate Shadow Work?
          </h2>
          
          <p className="text-xl text-purple-100 mb-8">
            Try the demo dashboard. No signup required.
          </p>
          
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-6 text-xl font-semibold shadow-xl hover:scale-105 transition-transform">
              Launch Dashboard →
            </Button>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-8 mt-8 text-purple-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Live demo data</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Branding */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src="/Echo_logo.png" 
                  alt="ECHO Logo" 
                  width={40} 
                  height={40}
                />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ECHO
                </h3>
              </div>
              <p className="text-gray-400">
                Eliminate shadow work with intelligent automation.
              </p>
            </div>
            
            {/* Column 2: Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="hover:text-purple-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com" className="hover:text-purple-400 transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Column 3: IBM Badge */}
            <div>
              <h4 className="font-semibold text-white mb-4">Built With</h4>
              <Badge className="bg-blue-600 text-white text-sm hover:bg-blue-700">
                Powered by IBM watsonx Orchestrate
              </Badge>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2025 ECHO. Built for IBM watsonx Orchestrate Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}