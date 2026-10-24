import * as path from "path";
import { leer_buzon, extraer, validar, registrar, alertas } from "./src/tools/contratos";

async function runDemo() {
  console.log("[*] Iniciando demo determinista del Reto 02 (sin modelo LLM)...");
  const ctx = { directory: process.cwd(), sessionId: "demo-session" };

  // 1. Leer buzón
  const buzonRes = JSON.parse(await leer_buzon.execute({}, ctx));
  console.log("\n[+] 1. contratos_leer_buzon ejecutado con éxito.");

  if (buzonRes.ok && buzonRes.data.mensajes) {
    for (const msg of buzonRes.data.mensajes) {
      console.log(`\n----------------------------------------`);
      console.log(`[*] Procesando mensaje: ${msg.id} | Asunto: ${msg.asunto}`);
      
      // 2. Extraer datos
      const extraerRes = JSON.parse(await extraer.execute({ mensaje_id: msg.id }, ctx));
      console.log(`    ↳ [Extraer]: Confianza general ${extraerRes.data.confianza_general}`);

      // 3. Validar contra maestro
      const validarRes = JSON.parse(await validar.execute({ mensaje_id: msg.id }, ctx));
      console.log(`    ↳ [Validar]: Clasificación -> ${validarRes.data.clasificacion}`);

      // 4. Registrar
      const registrarRes = JSON.parse(await registrar.execute({ mensaje_id: msg.id, confirmado: true }, ctx));
      console.log(`    ↳ [Registrar]: Acción -> ${registrarRes.data.accion} en ${registrarRes.data.ruta_archivo}`);
    }
  }

  // 5. Generar Alertas
  console.log(`\n----------------------------------------`);
  const alertasRes = JSON.parse(await alertas.execute({ hoy: "2026-09-03" }, ctx));
  console.log(`[+] 5. contratos_alertas generado en: ${alertasRes.data.ruta}`);
  console.log("\n[+] ¡Demo determinista finalizada con éxito!");
}

runDemo();