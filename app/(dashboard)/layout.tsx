import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PremiumNav from '@/components/PremiumNav'
import CommandPalette from '@/components/CommandPalette'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-accent selection:text-white">
            <PremiumNav userName={userName} />
            <CommandPalette />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 animate-enter">
                {children}
            </main>
        </div>
    )
}
