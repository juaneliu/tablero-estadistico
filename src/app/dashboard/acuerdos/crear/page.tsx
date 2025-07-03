import { Metadata } from "next"
import { FormularioAcuerdo } from "@/components/formulario-acuerdo"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Crear Nuevo Acuerdo",
  description: "Registrar un nuevo acuerdo de sesión"
}

export default function CrearAcuerdoPage() {
  return (
    <ProtectedRoute allowedRoles={['OPERATIVO', 'ADMINISTRADOR', 'SEGUIMIENTO']}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Crear Nuevo Acuerdo</h2>
            <p className="text-muted-foreground">
              Registra un nuevo acuerdo de sesión para su seguimiento
            </p>
          </div>
        </div>
        
        <FormularioAcuerdo />
      </div>
    </ProtectedRoute>
  )
}
