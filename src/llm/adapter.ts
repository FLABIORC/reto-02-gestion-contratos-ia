import dotenv from "dotenv";
dotenv.config();

export class OpenAiAdapter {
  private provider: string;
  private openAiApiKey?: string;
  private geminiApiKey?: string;
  private modelName: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || "openai";
    this.openAiApiKey = process.env.OPENAI_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.OPENAI_MODEL || "gpt-4o";
  }

  /**
   * Método principal para enviar mensajes al LLM configurado (OpenAI o Gemini)
   */
  async chat(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.provider === "gemini") {
      return this.callGeminiAPI(prompt, systemPrompt);
    } else {
      return this.callOpenAIAPI(prompt, systemPrompt);
    }
  }

  // Compatibilidad por si algún archivo llama a un método de envío genérico
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    return this.chat(prompt, systemPrompt);
  }

  // ── Implementación OpenAI ──
  private async callOpenAIAPI(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.openAiApiKey) {
      throw new Error("Falta la variable OPENAI_API_KEY en el entorno.");
    }

    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

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

  // ── Implementación Google Gemini (Gratuita / Freemium) ──
  private async callGeminiAPI(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error("Falta la variable GEMINI_API_KEY en el entorno.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUsuario: ${prompt}` : prompt;

    const contents = [{
      parts: [{ text: fullPrompt }]
    }];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error en API de Gemini: ${JSON.stringify(data)}`);
    }

    try {
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      throw new Error(`Respuesta inesperada de Gemini: ${JSON.stringify(data)}`);
    }
  }
}