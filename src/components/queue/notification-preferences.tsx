'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell } from 'lucide-react'

interface NotificationPreferencesProps {
  entryId: string
  initialOptIn?: boolean
}

export function NotificationPreferences({
  entryId,
  initialOptIn = true,
}: NotificationPreferencesProps) {
  const [optIn, setOptIn] = useState(initialOptIn)
  const [pending, setPending] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setPending(true)
    try {
      const res = await fetch(`/api/notifications/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, optIn: checked }),
      })

      if (res.ok) {
        setOptIn(checked)
      }
    } catch (error) {
      console.error('Failed to update preferences:', error)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Bell className={`h-4 w-4 ${optIn ? 'text-green-600' : 'text-gray-400'}`} />
      <Switch
        checked={optIn}
        onCheckedChange={handleToggle}
        disabled={pending}
        id="notification-preferences"
      />
      <Label htmlFor="notification-preferences">
        {optIn ? 'Notifications enabled' : 'Notifications disabled'}
      </Label>
    </div>
  )
}
