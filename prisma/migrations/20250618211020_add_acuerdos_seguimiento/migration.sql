-- CreateTable
CREATE TABLE "acuerdos_seguimiento" (
    "id" SERIAL NOT NULL,
    "numeroSesion" TEXT NOT NULL,
    "tipoSesion" TEXT NOT NULL,
    "fechaSesion" TIMESTAMP(3) NOT NULL,
    "temaAgenda" TEXT NOT NULL,
    "descripcionAcuerdo" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "fechaCompromiso" TIMESTAMP(3) NOT NULL,
    "prioridad" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "creadoPor" TEXT,

    CONSTRAINT "acuerdos_seguimiento_pkey" PRIMARY KEY ("id")
);
