import { Role } from '@prisma/client'

export interface JwtPayload {
  userId: string
  role: Role
  email: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
