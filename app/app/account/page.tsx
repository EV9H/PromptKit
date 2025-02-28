import AccountForm from './account-form'
import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'

export default async function Account() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // If not logged in, redirect to login page
    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Account</h1>
                <AccountForm user={user} />
            </div>
        </div>
    )
} 