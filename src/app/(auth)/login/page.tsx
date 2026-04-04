'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError('')

    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setServerError('Username atau password salah. Silakan coba lagi.')
      } else {
        setServerError('')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setServerError('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" role="main">
      <Card className="w-full max-w-md" aria-labelledby="login-title">
        <CardHeader className="space-y-1">
          <CardTitle id="login-title" className="text-2xl font-bold">
            Masuk
          </CardTitle>
          <CardDescription>Masukkan username dan password untuk mengakses sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            aria-label="Form login"
            noValidate
          >
            {serverError && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                autoComplete="username"
                aria-required="true"
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
                {...register('username')}
              />
              {errors.username && (
                <p id="username-error" className="text-sm text-destructive" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? <span aria-live="polite">Sedang masuk...</span> : 'Masuk'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Belum punya akun? Hubungi administrator untuk mendapatkan akses.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
