import Link from 'next/link';
import { TaskCard } from '@/components/TaskCard';
import { categories } from '@/lib/mockData';
import { Search, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  // No featured tasks displayed - users should browse the tasks page
  const featuredTasks: any[] = [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find the Perfect
              <span className="block text-yellow-400">Micro Task</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with skilled professionals for quick tasks or find tasks that fit your schedule.
              Get things done efficiently, one task at a time.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="What task do you need done?"
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tasks"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Find Tasks
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/post-task"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                Post a Task
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Tasks Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">25,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How MicroTask Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your tasks done or finding tasks has never been easier
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Post or Find Tasks</h3>
              <p className="text-gray-600">
                Post your task with clear requirements or browse available tasks that match your skills.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Connect & Collaborate</h3>
              <p className="text-gray-600">
                Review proposals, communicate with freelancers, and choose the best fit for your project.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Get It Done</h3>
              <p className="text-gray-600">
                Tasks get completed, payments are secured, and everyone leaves happy with great reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tasks */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Tasks
              </h2>
              <p className="text-gray-600">
                Discover high-quality tasks from verified clients
              </p>
            </div>
            <Link
              href="/tasks"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View All Tasks
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600">
              Find tasks in your area of expertise
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(1).map((category) => (
              <Link
                key={category}
                href={`/tasks?category=${category}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                  <div className="w-6 h-6 bg-blue-600 rounded" />
                </div>
                <h3 className="font-medium text-gray-900">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who trust MicroTask for their project needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up for Free
            </Link>
            <Link
              href="/post-task"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Post Your First Task
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
