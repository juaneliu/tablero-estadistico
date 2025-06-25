-- Script para agregar datos de prueba adicionales para el mapa de Morelos
-- Ejecutar este script en la base de datos para ver más municipios con datos

INSERT INTO "diagnosticos_municipales" (
  "nombreActividad",
  "municipio", 
  "actividad",
  "solicitudUrl",
  "respuestaUrl",
  "unidadAdministrativa",
  "evaluacion",
  "observaciones",
  "acciones",
  "estado",
  "fechaCreacion",
  "fechaActualizacion"
) VALUES
-- Cuernavaca
('Diagnóstico de Transparencia Municipal', 'Cuernavaca', 'Diagnóstico', 'https://drive.google.com/test1', 'https://drive.google.com/test1-resp', 'Dirección de Administración', 85, 'Buen nivel de cumplimiento', '[{"id":"action1","descripcion":"Revisar portal de transparencia","completada":true,"fechaLimite":"2025-07-01"}]', 'Completado', NOW(), NOW()),

-- Temixco  
('Indicador de Participación Ciudadana', 'Temixco', 'Indicador', 'https://drive.google.com/test2', NULL, 'Dirección de Participación Social', 70, 'Cumplimiento regular', '[{"id":"action2","descripcion":"Mejorar mecanismos de participación","completada":false,"fechaLimite":"2025-07-15"}]', 'En Proceso', NOW(), NOW()),

-- Tepoztlán
('Diagnóstico de Gestión Financiera', 'Tepoztlán', 'Diagnóstico', 'https://drive.google.com/test3', 'https://drive.google.com/test3-resp', 'Dirección de Finanzas', 90, 'Excelente manejo financiero', '[{"id":"action3","descripcion":"Mantener estándares","completada":true,"fechaLimite":"2025-06-30"}]', 'Completado', NOW(), NOW()),

-- Yautepec
('Indicador de Eficiencia Administrativa', 'Yautepec', 'Indicador', 'https://drive.google.com/test4', NULL, 'Dirección de Administración', 65, 'Requiere mejoras', '[{"id":"action4","descripcion":"Digitalizar procesos","completada":false,"fechaLimite":"2025-08-01"}]', 'En Proceso', NOW(), NOW()),

-- Tlayacapan
('Diagnóstico de Servicios Públicos', 'Tlayacapan', 'Diagnóstico', 'https://drive.google.com/test5', 'https://drive.google.com/test5-resp', 'Dirección de Servicios Públicos', 75, 'Servicios adecuados', '[{"id":"action5","descripcion":"Ampliar cobertura","completada":false,"fechaLimite":"2025-07-20"}]', 'En Proceso', NOW(), NOW()),

-- Jojutla
('Indicador de Desarrollo Social', 'Jojutla', 'Indicador', 'https://drive.google.com/test6', NULL, 'Dirección de Desarrollo Social', 80, 'Buen desarrollo social', '[{"id":"action6","descripcion":"Fortalecer programas","completada":true,"fechaLimite":"2025-06-25"}]', 'Completado', NOW(), NOW()),

-- Zacatepec
('Diagnóstico de Seguridad Pública', 'Zacatepec', 'Diagnóstico', 'https://drive.google.com/test7', NULL, 'Dirección de Seguridad', 55, 'Necesita atención urgente', '[{"id":"action7","descripcion":"Reforzar seguridad","completada":false,"fechaLimite":"2025-07-10"}]', 'Pendiente', NOW(), NOW()),

-- Puente de Ixtla
('Indicador de Infraestructura', 'Puente de Ixtla', 'Indicador', 'https://drive.google.com/test8', 'https://drive.google.com/test8-resp', 'Dirección de Obras Públicas', 95, 'Infraestructura excelente', '[{"id":"action8","descripcion":"Mantenimiento preventivo","completada":true,"fechaLimite":"2025-07-05"}]', 'Completado', NOW(), NOW()),

-- Emiliano Zapata
('Diagnóstico de Medio Ambiente', 'Emiliano Zapata', 'Diagnóstico', 'https://drive.google.com/test9', NULL, 'Dirección de Ecología', 60, 'Cumplimiento básico', '[{"id":"action9","descripcion":"Implementar programas verdes","completada":false,"fechaLimite":"2025-08-15"}]', 'En Proceso', NOW(), NOW()),

-- Hueyapan
('Indicador de Desarrollo Rural', 'Hueyapan', 'Indicador', 'https://drive.google.com/test10', 'https://drive.google.com/test10-resp', 'Dirección de Desarrollo Rural', 45, 'Requiere apoyo adicional', '[{"id":"action10","descripcion":"Programa de capacitación","completada":false,"fechaLimite":"2025-09-01"}]', 'Pendiente', NOW(), NOW());
