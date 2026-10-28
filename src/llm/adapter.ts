import dotenv from "dotenv";
dotenv.config();

const LLM_PROVIDER = process.env.LLM_PROVIDER || "openai"; // "openai" o "gemini"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.OPENAI_MODEL || "gpt-4o";

export async function callLLM(prompt: string, systemPrompt?: string): Promise<string> {
  if (LLM_PROVIDER === "gemini") {
    return callGeminiAPI(prompt, systemPrompt);
  } else {
    return callOpenAIAPI(prompt, systemPrompt);
  }
}

// ── Implementación OpenAI ──
async function callOpenAIAPI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("Falta la variable OPENAI_API_KEY en el entorno.");
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL_NAME,
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
async function callGeminiAPI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Falta la variable GEMINI_API_KEY en el entorno.");
  }

  // Usamos Gemini 1.5 Flash (rápido y con excelente capa gratuita)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const contents = [];
  // Si hay system prompt, se puede anteponer o inyectar en el contenido
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUsuario: ${prompt}` : prompt;

  contents.push({
    parts: [{ text: fullPrompt }]
  });

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