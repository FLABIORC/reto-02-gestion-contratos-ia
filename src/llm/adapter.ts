import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

export class OpenAiAdapter {
  private provider: string;
  private openAiApiKey?: string;
  private geminiApiKey?: string;
  private modelName: string;
  private geminiModelName: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || "openai";
    this.openAiApiKey = process.env.OPENAI_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.OPENAI_MODEL || "gpt-4o";
    this.geminiModelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  }

  async enviar(prompt: any, systemPrompt?: string): Promise<string> {
    return this.chat(prompt, systemPrompt);
  }

  async chat(prompt: any, systemPrompt?: string): Promise<string> {
    if (this.provider === "gemini") {
      return this.callGeminiSDKWithRetry(prompt, systemPrompt);
    } else {
      return this.callOpenAIAPI(prompt, systemPrompt);
    }
  }

  async generate(prompt: any, systemPrompt?: string): Promise<string> {
    return this.chat(prompt, systemPrompt);
  }

  // ── Implementación OpenAI ──
  private async callOpenAIAPI(prompt: any, systemPrompt?: string): Promise<string> {
    if (!this.openAiApiKey) {
      throw new Error("Falta la variable OPENAI_API_KEY en el entorno.");
    }

    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    
    if (Array.isArray(prompt)) {
      messages.push(...prompt);
    } else {
      messages.push({ role: "user", content: String(prompt) });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.openAiApiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: messages,
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error en API de OpenAI: ${JSON.stringify(data)}`);
    }

    return data.choices[0].message.content;
  }

  // ── Google Gemini SDK con Reintento Automático para errores 503 ──
  private async callGeminiSDKWithRetry(prompt: any, systemPrompt?: string, retries = 3, delay = 2000): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error("Falta la variable GEMINI_API_KEY en el entorno.");
    }

    const genAI = new GoogleGenerativeAI(this.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: this.geminiModelName,
      systemInstruction: systemPrompt ? systemPrompt : undefined
    });

    let textPrompt = "";
    if (typeof prompt === "string") {
      textPrompt = prompt;
    } else if (Array.isArray(prompt)) {
      textPrompt = prompt.map(m => `${m.role || "user"}: ${m.content || JSON.stringify(m)}`).join("\n");
    } else if (typeof prompt === "object" && prompt !== null) {
      textPrompt = prompt.content || JSON.stringify(prompt);
    } else {
      textPrompt = String(prompt);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await model.generateContent(textPrompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        // Si es error 503 y aún nos quedan intentos, esperamos y reintentamos
        if (errorMessage.includes("503") && attempt < retries) {
          console.warn(`[Gemini] Servidores saturados (503). Reintentando intento ${attempt} de ${retries} en ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // Espera exponencial
        } else {
          throw error;
        }
      }
    }
    throw new Error("No se pudo conectar con Gemini tras varios intentos por alta demanda.");
  }
}