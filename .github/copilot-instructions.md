# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

Este es un proyecto de dashboard estadístico construido con Next.js 14, TypeScript y Tailwind CSS. 

## Tecnologías y patrones a seguir:

- **Next.js 14** con App Router y Server Components
- **TypeScript** para tipado fuerte 
- **Tailwind CSS** para estilos con design system consistente
- **Radix UI** para componentes accesibles y reutilizables
- **Recharts** para visualizaciones de datos
- **Lucide React** para iconografía

## Estructura del proyecto:

- `src/app/` - App Router con páginas y layouts
- `src/components/ui/` - Componentes de UI reutilizables
- `src/components/` - Componentes específicos del dominio
- `src/lib/` - Utilidades y configuraciones

## Convenciones de código:

1. Usar componentes funcionales con TypeScript
2. Implementar Server Components por defecto, Client Components solo cuando sea necesario
3. Seguir el patrón de composición de componentes de Radix UI
4. Usar Tailwind CSS con clases utilitarias
5. Mantener componentes pequeños y enfocados en una responsabilidad
6. Implementar proper error boundaries y loading states
7. Usar el hook `cn()` para concatenar clases CSS de manera condicional

## Temas de diseño:

- Soporte para modo claro/oscuro
- Paleta de colores moderna y accesible
- Typography consistente
- Espaciado y layout responsivo
- Componentes con estados de hover, focus y disabled

## Datos y estado:

- Preferir Server Components para data fetching
- Usar React hooks para estado del cliente
- Implementar loading skeletons para mejor UX
- Manejar errores de manera elegante
