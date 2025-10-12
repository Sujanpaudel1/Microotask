import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <span className="font-bold text-xl">MicroTask</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            The leading marketplace for micro tasks. Connect with skilled professionals and get your projects completed efficiently.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* For Clients */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">For Clients</h3>
                        <div className="space-y-2">
                            <Link href="/post-task" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Post a Task
                            </Link>
                            <Link href="/freelancers" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Find Freelancers
                            </Link>
                            <Link href="/how-it-works" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                How It Works
                            </Link>
                            <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Pricing
                            </Link>
                        </div>
                    </div>

                    {/* For Freelancers */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">For Freelancers</h3>
                        <div className="space-y-2">
                            <Link href="/tasks" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Find Tasks
                            </Link>
                            <Link href="/register" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Join as Freelancer
                            </Link>
                            <Link href="/success-stories" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Success Stories
                            </Link>
                            <Link href="/resources" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Resources
                            </Link>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Support</h3>
                        <div className="space-y-2">
                            <Link href="/help" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Help Center
                            </Link>
                            <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Contact Us
                            </Link>
                            <Link href="/trust-safety" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Trust & Safety
                            </Link>
                            <Link href="/terms" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Terms of Service
                            </Link>
                            <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © 2025 MicroTask. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                            Privacy
                        </Link>
                        <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}