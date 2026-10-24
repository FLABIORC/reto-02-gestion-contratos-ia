import express, { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { leer_buzon, extraer, validar, registrar, alertas } from "./tools/contratos";
import { OpenAiAdapter } from "./llm/adapter";

dotenv.config();

const app = express();
app.use(express.json());
// Servir archivos estáticos de la interfaz web
app.use(express.static(path.join(process.cwd(), "web")));

const PORT = process.env.PORT || 3000;
const llm = new OpenAiAdapter();

// Endpoint Health Check (Requerido por PRD 6.4)
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    ok: true,
    provider: "openai",
    model: process.env.OPENAI_MODEL || "gpt-4o"
  });
});

// Endpoint de Chat principal
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;
    if (!message) {
      return res.status(400).json({ ok: false, error: "El mensaje es obligatorio." });
    }

    const promptPath = path.join(process.cwd(), "agent", "prompt.md");
    const systemPrompt = fs.existsSync(promptPath) 
      ? fs.readFileSync(promptPath, "utf-8") 
      : "Eres un asistente de contratos.";

    let reply = "";
    const ctx = { directory: process.cwd(), sessionId: sessionId || "default" };
    const lowerMsg = message.toLowerCase();

    // Enrutamiento inteligente de intenciones para la demo y chat
    if (lowerMsg.includes("buzón") || lowerMsg.includes("buzon")) {
      const buzonResult = JSON.parse(await leer_buzon.execute({}, ctx));
      reply = `He consultado el buzón. Se encontraron ${buzonResult.data.mensajes.length} mensajes pendientes por procesar.`;
    } else if (lowerMsg.includes("alerta")) {
      const alertasResult = JSON.parse(await alertas.execute({ hoy: "2026-09-03" }, ctx));
      reply = `Reporte de alertas generado con éxito en la ruta ${alertasResult.data.ruta}.`;
    } else {
      const mensajes = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: message }
      ];
      reply = await llm.enviar(mensajes);
    }

    res.json({
      ok: true,
      reply,
      toolCalls: [],
      needsConfirmation: false
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[+] Servidor backend corriendo en http://localhost:${PORT}`);
});