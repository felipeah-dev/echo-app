//app/page.tsx (esto es la landingpage)

'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, PlayCircle, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Datos para las secciones
  const manualSteps = [
    { icon: "💬", text: "Post update in Slack", time: "2 min" },
    { icon: "📊", text: "Update forecast in Google Sheets", time: "3 min" },
    { icon: "📧", text: "Send confirmation email", time: "5 min" },
    { icon: "📅", text: "Schedule follow-up meeting", time: "5 min" }
  ]

  const stats = [
    { 
      number: "30-40%", 
      label: "of work time is repetitive copy/paste",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      number: "3-5 hours", 
      label: "wasted daily per sales rep",
      gradient: "from-pink-500 to-red-500"
    },
    { 
      number: "$120K", 
      label: "lost annually per 10-person team",
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
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo + Badge */}
            <Link href="/" className="flex items-center gap-2 sm:gap-4 group">
              <div className="flex items-center gap-2 sm:gap-3">
                <Image 
                  src="/Echo_logo.png" 
                  alt="ECHO Logo" 
                  width={36} 
                  height={36}
                  className="sm:w-12 sm:h-12 transition-transform group-hover:scale-110"
                />
                <div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ECHO
                  </span>
                  <div className="hidden sm:flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600 px-2 py-0">
                      Powered by IBM watsonx
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Desktop CTA Button */}
            <div className="hidden sm:block">
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all">
                  Try Dashboard →
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="sm:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200 py-4">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Try Dashboard →
                </Button>
              </Link>
              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600 px-2 py-1 mt-3 mx-auto block w-fit">
                Powered by IBM watsonx
              </Badge>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />

      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-70" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight px-2">
              Stop Copying. <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Start Automating.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              30-40% of your workday is shadow work—copying the same data across Slack, 
              Google Sheets, Email, and Calendar. ECHO eliminates it with one click, 
              powered by IBM watsonx Orchestrate.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                  Try Demo Dashboard →
                </Button>
              </Link>
            </div>

            {/* Promotional Video */}
            <div className="mt-12 sm:mt-16 max-w-5xl mx-auto px-4">
              <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg sm:rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px sm:30px sm:30px'
                  }} />
                </div>
                
                <div className="relative z-10 text-center px-4">
                  <div className="mb-3 sm:mb-4">
                    <div className="inline-block p-3 sm:p-4 bg-white/10 rounded-full mb-3 sm:mb-4 backdrop-blur-sm">
                      <PlayCircle className="h-10 w-10 sm:h-16 sm:w-16 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Why ECHO Changes Everything</h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4">See the problem ECHO solves—explained simply</p>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 transition-transform text-sm sm:text-base">
                    <PlayCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Watch Now
                  </Button>
                  <p className="text-white/70 text-xs sm:text-sm mt-2 sm:mt-3">2 minutes • No signup required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEMA */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
            The Shadow Work Epidemic
          </h2>

          <p className="text-base sm:text-lg text-gray-600 text-center max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
            Every time you update a deal, you manually:
          </p>

          {/* Manual Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {manualSteps.map((step, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-5 sm:p-6 border border-gray-200">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{step.text}</h3>
                <p className="text-xs sm:text-sm text-purple-600 font-medium">{step.time}</p>
              </div>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${stat.gradient} p-6 sm:p-8 rounded-xl shadow-lg text-white transform transition-transform hover:scale-105`}
              >
                <div className="text-4xl sm:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-base sm:text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: SOLUCIÓN */}
      <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12 sm:mb-16 px-4">
            The ECHO Way: <span className="text-purple-600">Automate Everything</span>
          </h2>

          {/* How It Works Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 md:gap-4">
            {howItWorks.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center relative">
                {/* Número del paso con gradiente */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4 shadow-lg">
                  {step.step}
                </div>
                
                {/* Ícono grande */}
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{step.icon}</div>
                
                {/* Título */}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                
                {/* Descripción */}
                <p className="text-gray-600 text-sm leading-relaxed px-4 sm:px-0">{step.description}</p>
                
                {/* Badge opcional para watsonx */}
                {step.badge && (
                  <Badge className="mt-3 sm:mt-4 bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm">
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
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
            Why ECHO Beats Manual Work
          </h2>

          <p className="text-base sm:text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12 sm:mb-16 px-4">
            Not another Zapier. ECHO combines pattern detection with enterprise-grade orchestration.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-5 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300">
                {/* Badge en esquina superior */}
                <Badge className="mb-3 sm:mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs sm:text-sm">
                  {feature.badge}
                </Badge>
                
                {/* Ícono grande */}
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{feature.icon}</div>
                
                {/* Título */}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                
                {/* Descripción */}
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA FINAL */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Ready to Eliminate Shadow Work?
          </h2>
          
          <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8">
            Try the demo dashboard. No signup required.
          </p>
          
          <Link href="/dashboard" className="inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-semibold shadow-xl hover:scale-105 transition-transform">
              Launch Dashboard →
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8 mt-6 sm:mt-8 text-purple-100">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">No credit card required</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">2-minute setup</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Live demo data</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Column 1: Branding */}
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <Image 
                  src="/Echo_logo.png" 
                  alt="ECHO Logo" 
                  width={36} 
                  height={36}
                  className="sm:w-10 sm:h-10"
                />
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ECHO
                </h3>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Eliminate shadow work with intelligent automation.
              </p>
            </div>
            
            {/* Column 2: Links */}
            <div className="text-center sm:text-left">
              <h4 className="font-semibold text-white mb-4 text-base sm:text-lg">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="hover:text-purple-400 transition-colors text-sm sm:text-base">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors text-sm sm:text-base">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com" className="hover:text-purple-400 transition-colors text-sm sm:text-base">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Column 3: IBM Badge */}
            <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h4 className="font-semibold text-white mb-4 text-base sm:text-lg">Built With</h4>
              <Badge className="bg-blue-600 text-white text-xs sm:text-sm hover:bg-blue-700 inline-block">
                Powered by IBM watsonx Orchestrate
              </Badge>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-xs sm:text-sm">
            <p>© 2025 ECHO. Built for IBM watsonx Orchestrate Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}