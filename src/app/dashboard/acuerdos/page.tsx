import { Metadata } from "next"
import { TableroAcuerdos } from "@/components/tablero-acuerdos"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Acuerdos y Seguimientos",
  description: "Gestión y seguimiento de acuerdos de sesiones"
}

export default function AcuerdosPage() {
  return (
    <ProtectedRoute allowedRoles={['INVITADO', 'OPERATIVO', 'ADMINISTRADOR', 'SEGUIMIENTO']}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Acuerdos y Seguimientos</h2>
            <p className="text-muted-foreground">
              Gestiona y da seguimiento a los acuerdos tomados en las sesiones
            </p>
          </div>
        </div>
        
        <TableroAcuerdos />
      </div>
    </ProtectedRoute>
  )
}
