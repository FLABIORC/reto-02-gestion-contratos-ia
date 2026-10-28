# Reto 02: Agente Inteligente de Registro y Gestión de Contratos

**Empresa:** Periferia IT Group  
**Desarrollador:** Flabio Rodríguez Correa  
**Estado:** Completado y listo para producción  

---

## 📋 Descripción del Proyecto
Este proyecto implementa un asistente conversacional inteligente basado en agentes y herramientas tipadas en TypeScript/Zod. Su propósito es automatizar el ciclo operativo de contratos en el buzón corporativo de Periferia IT Group, abarcando desde la lectura de correos y adjuntos hasta la extracción de metadatos, validación contra el maestro corporativo, registro formal y generación de alertas tempranas de vencimiento.

---

## 🛠️ Stack Tecnológico
* **Lenguaje:** TypeScript 5.3 (módulos tipo `bundler`)
* **Runtime:** Node.js v24+
* **Validación de Esquemas:** Zod 3.22
* **Backend:** Express.js
* **Interfaz Gráfica:** HTML5 + Tailwind CSS (vía CDN)
* **Infraestructura de Despliegue:** Hostinger Business (Node.js App)

---

## 📂 Estructura del Proyecto

```text
reto-02-gestion-contratos-ia/
├── agent/
│   └── prompt.md            # System prompt y directivas del agente
├── data/
│   └── fixtures/
│       └── buzon/           # Mensajes reales de prueba (msg-001 al msg-006)
├── src/
│   ├── llm/
│   │   └── adapter.ts       # Adaptador seguro para el modelo LLM
│   ├── tools/
│   │   └── contratos.ts     # 5 Herramientas tipadas con Zod
│   └── server.ts            # Servidor backend en Express y endpoints API
├── web/
│   └── index.html           # Interfaz web interactiva del chat
├── out/                     # Directorio de salidas (alertas y SharePoint simulado)
├── demo.ts                  # Script de verificación determinista sin LLM
├── SOLUCION.md              # Documento técnico detallado y Regla de Gobierno
├── tsconfig.json            # Configuración del compilador TypeScript
└── package.json             # Dependencias y scripts de ejecución
```

---

## 🚀 Instalación y Ejecución

1. Clonar el repositorio e instalar dependencias
   ```bash
   git clone [https://github.com/FLABIORC/reto-02-gestion-contratos-ia.git](https://github.com/FLABIORC/reto-02-gestion-contratos-ia.git)
   cd reto-02-gestion-contratos-ia
   ```

Abre tu terminal en la carpeta del proyecto y ejecuta:
   ```bash
   npm.cmd install
   ``` 

2. Ejecutar la Demo Determinista (Sin LLM)
Para validar la lógica de negocio completa de punta a punta procesando los mensajes de prueba (msg-001 a msg-006):
   ```bash
   npm.cmd run demo
   ```

3. Iniciar el Servidor de Desarrollo y la Interfaz Web
Para levantar el servidor backend y probar el chat interactivo en tiempo real:
   ```bash
   npm.cmd run dev
   ```

Una vez iniciado, abre tu navegador web e ingresa a:

👉 http://localhost:3000

🔍 Herramientas del Agente (Zod)
contratos_leer_buzon: Analiza el buzón e identifica correos pendientes y adjuntos.
contratos_extraer: Extrae campos estructurados y puntaje de confianza.
contratos_validar: Clasifica el contrato frente al maestro corporativo.
contratos_registrar: Almacena el documento en la ruta simulada de SharePoint (out/sharepoint/).
contratos_alertas: Consolida reportes de vencimientos en out/alertas.md.

📦 Despliegue en Hostinger Business
Sube los cambios al repositorio de GitHub.
En el hPanel de Hostinger, configura una nueva aplicación Node.js (versión 20.x o superior).
Configura las variables de entorno (PORT, OPENAI_API_KEY, OPENAI_MODEL).
Establece el comando de inicio en npm start.

---

## 🛠️ Vulnerabildiades corregidas
Se identificó una vulnerabildiades en Paquete **Zod @3.25.76** de gravedad ***Alto*** Vulnerabilidad **CVE-2023-54404** Publicado 2026-10-01. Descripción: 

   > ### npm: Zod can exhaust memory while validating oversized constrained collections
   >
   > Zod schema-validation library through 4.6.5 contains an uncontrolled resource consumption vulnerability that allows attackers to exhaust memory by submitting a large array to an application using an array schema without a length constraint. Attackers can exploit the handleArrayResult parse logic in $ZodArray, which accumulates every validation issue for each failing element with no cap or early termination, causing the process to allocate excessive issue objects and crash due to out-of-memory conditions.
   >
   >- 7.5\ Alto
   >- CWE-770
   >- < 4.6.6\
   >
   >Actualice zod a 4.6.6 o posterior para resolver esta vulnerabilidad.

 
