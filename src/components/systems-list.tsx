import Image from "next/image"

const systems = [
  {
    icon: "/icons/s1.svg",
    description: "Sistema de evolución patrimonial, de declaración de intereses y constancia de presentación de declaración fiscal"
  },
  {
    icon: "/icons/s2.svg", 
    description: "Sistema de los Servidores públicos que intervengan en procedimientos de contrataciones públicas"
  },
  {
    icon: "/icons/s3-oic.svg",
    description: "Sistema nacional de Servidores públicos y particulares sancionados"
  },
  {
    icon: "/icons/s6.svg",
    description: "Sistema de Información Pública de Contrataciones"
  }
]

export function SystemsList() {
  return (
    <div className="space-y-1">
      {systems.map((system, index) => (
        <p key={index} className="flex items-start text-sm leading-tight">
          <span className="mr-2 w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
            <Image
              src={system.icon}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </span>
          <span className="text-slate-700">
            - {system.description}
          </span>
        </p>
      ))}
    </div>
  )
}
