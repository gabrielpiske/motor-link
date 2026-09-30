'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export type UserRole = 'admin' | 'student'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedPanel?: number
}

export function RouteGuard({ children, requiredRole, allowedPanel }: RouteGuardProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Se não houver usuário ou perfil autenticado, o middleware ou esta lógica redireciona
      if (!user || !profile) {
        router.replace('/login')
        return
      }

      // Restrições de Perfil: admin é obrigatório, mas o usuário é student
      if (requiredRole === 'admin' && profile.role === 'student') {
        router.replace('/')
        return
      }

      // Restrições de Bancada: student tenta acessar uma bancada diferente da designada
      if (
        profile.role === 'student' &&
        allowedPanel !== undefined &&
        profile.assignedPanel !== allowedPanel
      ) {
        router.replace(`/controle?bancada=${profile.assignedPanel}`)
        return
      }
    }
  }, [user, profile, loading, requiredRole, allowedPanel, router])

  // Exibe spinner enquanto carrega os dados de auth
  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-slate-400 font-medium">Verificando autorização...</p>
        </div>
      </div>
    )
  }

  // Usuário autorizado
  return <>{children}</>
}
