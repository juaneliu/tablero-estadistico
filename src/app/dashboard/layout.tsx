import { TopNav } from "@/components/top-nav"
import { MainNav } from "@/components/main-nav"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'OPERATIVO', 'SEGUIMIENTO', 'INVITADO']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        <TopNav />
        <MainNav />
        <main className="lg:ml-64 pt-14 md:pt-16">
          <div className="min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
