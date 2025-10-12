'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get redirect URL from query params
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    // Google client ID provided by the user
    const GOOGLE_CLIENT_ID = '70701411090-qn40im1n8qi1773qdd4qt7sv8d0db4kb.apps.googleusercontent.com';

    const handleGoogleCredentialResponse = useCallback(async (response: any) => {
        if (!response?.credential) {
            setError('Google sign-in failed: no credential returned');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_token: response.credential }),
            });

            const data = await res.json();
            if (res.ok) {
                router.push(redirectUrl);
            } else {
                setError(data.error || 'Google sign-in failed');
            }
        } catch (err) {
            console.error('Google sign-in error:', err);
            setError('Something went wrong with Google sign-in');
        } finally {
            setLoading(false);
        }
    }, [router, redirectUrl]);

    useEffect(() => {
        // Load Google Identity Services script and initialize the button
        const id = 'google-identity-script';

        function initialize() {
            const google = (window as any).google;
            if (!google?.accounts?.id) return;

            try {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredentialResponse,
                });

                const container = document.getElementById('googleSignInDiv');
                if (container) {
                    // Clear any previous rendered button
                    container.innerHTML = '';
                    google.accounts.id.renderButton(container, {
                        theme: 'outline',
                        size: 'large',
                        width: '100%',
                    });
                }
            } catch (e) {
                console.error('Error initializing Google Identity Services:', e);
            }
        }

        if (!document.getElementById(id)) {
            const script = document.createElement('script');
            script.id = id;
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initialize;
            document.head.appendChild(script);
        } else {
            initialize();
        }

        return () => {
            // optional cleanup: remove script if desired
        };
    }, [handleGoogleCredentialResponse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push(redirectUrl);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Use your Google account to sign in.
                    </p>
                </div>

                <div className="mt-8 grid gap-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="relative">
                                <label htmlFor="email" className="sr-only">
                                    Email address
                                </label>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative">
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-12 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <div className="text-sm text-gray-500">or</div>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div>
                        <div id="googleSignInDiv" />
                    </div>

                    <div className="text-center mt-2">
                        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Create a new account
                        </Link>
                    </div>
                    <div className="text-center mt-2">
                        <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}