-- CreateTable
CREATE TABLE "entes_publicos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ambitoGobierno" TEXT NOT NULL,
    "poderGobierno" TEXT NOT NULL,
    "controlOIC" BOOLEAN NOT NULL DEFAULT false,
    "controlTribunal" BOOLEAN NOT NULL DEFAULT false,
    "sistema1" BOOLEAN NOT NULL DEFAULT false,
    "sistema2" BOOLEAN NOT NULL DEFAULT false,
    "sistema3" BOOLEAN NOT NULL DEFAULT false,
    "sistema6" BOOLEAN NOT NULL DEFAULT false,
    "entidad" JSONB NOT NULL,
    "municipio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entes_publicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directorio_oic" (
    "id" SERIAL NOT NULL,
    "oicNombre" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correoElectronico" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "entidad" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "directorio_oic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directorio_oic_entes" (
    "id" SERIAL NOT NULL,
    "directorioOICId" INTEGER NOT NULL,
    "entePublicoId" INTEGER NOT NULL,

    CONSTRAINT "directorio_oic_entes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "directorio_oic_entes_directorioOICId_entePublicoId_key" ON "directorio_oic_entes"("directorioOICId", "entePublicoId");

-- AddForeignKey
ALTER TABLE "directorio_oic_entes" ADD CONSTRAINT "directorio_oic_entes_directorioOICId_fkey" FOREIGN KEY ("directorioOICId") REFERENCES "directorio_oic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directorio_oic_entes" ADD CONSTRAINT "directorio_oic_entes_entePublicoId_fkey" FOREIGN KEY ("entePublicoId") REFERENCES "entes_publicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
