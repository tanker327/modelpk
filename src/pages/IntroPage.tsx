import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MdRocket, MdSpeed, MdCompare, MdCode, MdSecurity, MdCloudOff, MdAttachMoney, MdSettings } from 'react-icons/md'
import { FaGithub } from 'react-icons/fa'

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <MdRocket className="text-blue-600" size={28} />
              <span className="text-2xl font-bold text-gray-900">ModelPK</span>
            </div>
            <TooltipProvider>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/pk">
                      <Button variant="outline" size="icon" className="font-semibold">
                        PK
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start Model Comparison</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/pricing">
                      <Button variant="outline" size="icon">
                        <MdAttachMoney size={20} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Latest Model Cost</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/config">
                      <Button variant="outline" size="icon">
                        <MdSettings size={20} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configure Providers</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="https://github.com/tanker327/modelpk" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon">
                        <FaGithub size={20} />
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on GitHub</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MdSpeed />
            <span>Battle-test your AI models</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Compare AI Models
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Side-by-Side
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            ModelPK lets you race multiple AI models against each other with the same prompt.
            Compare quality, speed, and cost to find the perfect model for your use case.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/pk">
              <Button size="lg" className="text-2xl px-16 py-8 h-auto font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                Start to PK
                <MdRocket className="ml-3 animate-bounce" size={32} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose ModelPK?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <MdCompare className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Real-Time Comparison
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Send the same prompt to multiple models simultaneously and see results appear in real-time.
                Compare quality, creativity, and accuracy instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <MdSpeed className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Performance Metrics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track response time, token usage, and cost for each model.
                Identify the fastest and most cost-effective options for your needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <MdCloudOff className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                100% Client-Side
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Runs entirely in your browser with no backend infrastructure.
                Your prompts and API keys stay completely private on your device.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <MdSecurity className="text-orange-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure Storage
              </h3>
              <p className="text-gray-600 leading-relaxed">
                API keys are encrypted using Web Crypto API before storage in IndexedDB.
                Your credentials stay safe and secure on your device.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <MdCode className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Multiple Providers
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Support for OpenAI, Anthropic, Google Gemini, xAI, Ollama, and OpenRouter.
                Mix and match models from different providers in one comparison.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center mb-6">
                <MdRocket className="text-pink-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Advanced Parameters
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Fine-tune model behavior with temperature, top-p, frequency penalty,
                and more. Perfect for power users and developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Configure Your Providers
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Add API keys for the providers you want to use. Configure OpenAI, Anthropic, Gemini,
                  or run models locally with Ollama. Select which models you want to compare.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Choose Your Models
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Select one or more models from each provider. You can compare as many models as you want
                  in a single race. Mix GPT-4, Claude, Gemini, and more.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Submit Your Prompt
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Enter your system and user prompts. Optionally configure advanced parameters like
                  temperature and max tokens. Hit submit and watch the race begin!
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Compare Results
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  See all responses side-by-side in real-time. Compare quality, speed, token usage,
                  and cost. Identify winners and make informed decisions about which model to use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Start Racing?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join developers and teams who use ModelPK to find the best AI models for their needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100">
                Start to PK
                <MdRocket className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white/10">
                View Latest Model Cost
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MdRocket className="text-blue-400" size={24} />
            <span className="text-xl font-bold text-white">ModelPK</span>
          </div>
          <p className="text-sm">
            Compare AI models side-by-side. Built with React, powered by your browser.
          </p>
          <div className="mt-6 text-xs text-gray-500">
            All API calls are made directly from your browser. No backend servers.
          </div>
        </div>
      </footer>
    </div>
  )
}
