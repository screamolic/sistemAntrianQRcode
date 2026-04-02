'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Users, Settings, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { signOut } from '@/lib/auth'

interface MobileNavProps {
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  } | null
}
