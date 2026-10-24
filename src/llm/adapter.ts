import dotenv from "dotenv";
dotenv.config();

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMAdapter {
  enviar(mensajes: Message[]): Promise<string>;
}

export class OpenAiAdapter implements LLMAdapter {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  async enviar(mensajes: Message[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY no está configurada en las variables de entorno.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: mensajes,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Error en API de OpenAI: ${err}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  }
}