# Reto 02: Gestión y Análisis Inteligente de Contratos y Buzón

Solución automatizada basada en Inteligencia Artificial y Procesamiento de Lenguaje Natural (PLN) para la ingesta, extracción de entidades y conciliación de contratos, adendas y comunicaciones comerciales de un buzón corporativo.

## 📋 Descripción General
El sistema procesa de forma autónoma los mensajes y documentos adjuntos provenientes del buzón (`msg-001` a `msg-006`), extrayendo cláusulas críticas, montos y vigencias, y contrastándolos contra los registros maestros de la organización (`maestro-contratos.csv` y `comerciales.json`) para garantizar la integridad contractual y mitigar riesgos legales y financieros.

## ⚙️ Arquitectura de la Solución
1. **Ingesta de Datos:** Normalización de correos electrónicos (`correo.json`) y documentos legales (`contrato.txt`, `otrosi.txt`, `cotizacion.txt`).
2. **Extracción Estructurada (IA):** Uso de modelos de lenguaje con esquemas estrictos para la identificación de entidades clave (Fechas, Montos, Partes, Modificaciones).
3. **Motor de Conciliación:** Cruce automatizado con bases de datos maestras para la detección de discrepancias e inconsistencias.

## 🚀 Instalación y Ejecución

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/FLABIORC/reto-02-gestion-contratos-ia.git](https://github.com/FLABIORC/reto-02-gestion-contratos-ia.git)
   cd reto-02-gestion-contratos-ia