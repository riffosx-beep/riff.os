'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    useEffect(() => {
        // Check local storage or system preference
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (storedTheme) {
            setTheme(storedTheme)
            document.documentElement.setAttribute('data-theme', storedTheme)
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark')
            document.documentElement.setAttribute('data-theme', 'dark')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    )
}
