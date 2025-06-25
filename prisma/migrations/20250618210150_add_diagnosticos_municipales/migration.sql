-- CreateTable
CREATE TABLE "diagnosticos_municipales" (
    "id" SERIAL NOT NULL,
    "nombreActividad" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "actividad" TEXT NOT NULL,
    "solicitudUrl" TEXT,
    "respuestaUrl" TEXT,
    "unidadAdministrativa" TEXT NOT NULL,
    "evaluacion" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "acciones" JSONB,
    "estado" TEXT NOT NULL DEFAULT 'En Proceso',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "creadoPor" TEXT,

    CONSTRAINT "diagnosticos_municipales_pkey" PRIMARY KEY ("id")
);
