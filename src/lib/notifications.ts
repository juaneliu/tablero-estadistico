// Sistema de notificaciones nativo del proyecto
// Estas funciones usan el sistema de notificaciones personalizado

import { 
  showSuccess as showSuccessNotification,
  showError as showErrorNotification,
  showWarning as showWarningNotification,
  showConfirm as showConfirmNotification,
  showLoadingAlert as showLoadingNotification,
  closeLoadingAlert as closeLoadingNotification,
  forceCloseAllNotifications as forceCloseAllNotificationsInternal
} from '@/components/ui/notifications'

export const showSuccess = showSuccessNotification
export const showError = showErrorNotification
export const showWarning = showWarningNotification
export const showConfirm = showConfirmNotification
export const showLoadingAlert = showLoadingNotification
export const closeLoadingAlert = closeLoadingNotification
export const forceCloseAllNotifications = forceCloseAllNotificationsInternal

export const showMissingFieldsError = async (missingFields: string[]) => {
  const fieldsList = missingFields.map(field => `• ${field}`).join('\n')
  return await showWarningNotification(
    '⚠️ Campos Obligatorios Faltantes',
    `Para crear el diagnóstico municipal, debe completar los siguientes campos obligatorios:\n\n${fieldsList}\n\nPor favor, complete todos los campos marcados con (*) antes de continuar.`
  )
}

export const showUrlValidationError = async (invalidUrls: string[]) => {
  const urlsList = invalidUrls.join('\n')
  return await showErrorNotification(
    '🔗 URLs Inválidas Detectadas',
    `Las siguientes URLs no son válidas:\n\n${urlsList}\n\nRequisitos:\n• Debe comenzar con http:// o https://\n• Debe ser una URL completa y válida\n• Ejemplo: https://ejemplo.com/archivo.pdf`
  )
}

// Funciones específicas para casos comunes
export const showDeleteConfirmation = async (itemName: string = 'este elemento') => {
  return await showConfirmNotification(
    '🗑️ Confirmar Eliminación',
    `¿Está seguro de que desea eliminar ${itemName}? Esta acción no se puede deshacer.`,
    'Sí, eliminar',
    'Cancelar'
  )
}

export const showSaveConfirmation = async () => {
  return await showConfirmNotification(
    '💾 Confirmar Guardado',
    '¿Está seguro de que desea guardar los cambios realizados?',
    'Guardar',
    'Cancelar'
  )
}
