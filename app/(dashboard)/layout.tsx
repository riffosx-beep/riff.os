import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
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
    const userEmail = user.email || ''

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar userName={userName} userEmail={userEmail} />
            <CommandPalette />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 ease-in-out">
                <TopBar userName={userName} />
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-enter pb-20">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
