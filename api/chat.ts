import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history, riskProfile, portfolioSummary } = req.body;

    const apiKey = process.env.AI_AGENT_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI Agent API key no está configurada en el servidor.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: `Eres Nexus AI, el analista experto de NEXUS FA.
Tu objetivo es analizar activos como OXY, AAPL, BTC, CETES, ORO, FIBRAS basándote en reportes de grandes inversores (simula el estilo de análisis de figuras como Warren Buffett o analistas de tecnología de primer nivel) y noticias macroeconómicas verdaderamente importantes (como tasas de la Fed o Banxico).
Las respuestas deben ser concisas, precisas y fácilmente digeribles para cualquier persona que empieza en las inversiones.
Siempre debes recordar al usuario al final de tus respuestas clave que tus sugerencias son estrictamente educativas y no constituyen asesoría financiera legal.

Contexto del usuario actual:
Perfil de Inversión (Apetito de Riesgo): ${riskProfile || 'No definido'}
Portafolio Actual (Cantidades y Activos):
${portfolioSummary || 'Sin activos'}

El usuario te preguntará sobre puntos de entrada/salida técnicos, impacto de noticias y alineación con su portafolio. Basa tus recomendaciones en su contexto específico.`
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error: any) {
    console.error('Error en AI chat:', error);
    res.status(500).json({ error: `Error de IA: ${error.message || JSON.stringify(error)}` });
  }
}
