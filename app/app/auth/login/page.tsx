import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from '../login-form'

export default async function LoginPage() {
    const supabase = await createClient()

    // Check if the user is already logged in
    const { data: { user } } = await supabase.auth.getUser()

    // If the user is already logged in, redirect to the account page
    if (user) {
        redirect('/account')
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <LoginForm />
            </div>
        </div>
    )
} 