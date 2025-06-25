-- CreateTable
CREATE TABLE "seguimientos" (
    "id" SERIAL NOT NULL,
    "acuerdoId" INTEGER NOT NULL,
    "seguimiento" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "fechaSeguimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "creadoPor" TEXT,

    CONSTRAINT "seguimientos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_acuerdoId_fkey" FOREIGN KEY ("acuerdoId") REFERENCES "acuerdos_seguimiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
