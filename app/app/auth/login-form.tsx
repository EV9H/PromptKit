'use client'

import { useState } from 'react'
import { createClient } from '../supabase/client'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Redirect happens automatically by the middleware
        } catch (error: any) {
            setError(error.message || 'An error occurred during sign in')
        } finally {
            setLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error

            alert('Check your email for the confirmation link')
        } catch (error: any) {
            setError(error.message || 'An error occurred during sign up')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col space-y-4 min-w-[350px]">
            <h1 className="text-2xl font-bold">Sign In / Sign Up</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
                    >
                        {loading ? 'Loading...' : 'Sign In'}
                    </button>

                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
                    >
                        {loading ? 'Loading...' : 'Sign Up'}
                    </button>
                </div>
            </form>
        </div>
    )
} 