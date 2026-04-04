import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
    email: z.string().email('Alamat email tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
