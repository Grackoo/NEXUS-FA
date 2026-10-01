import { GoogleGenerativeAI } from '@google/generative-ai';

// Modelos soportados con orden de prioridad y respaldo automático
const DEFAULT_CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

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
    const { 
      message, 
      history, 
      riskProfile, 
      portfolioSummary, 
      preferredModel 
    } = req.body;

    const apiKey = process.env.AI_AGENT_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI Agent API key no está configurada en el servidor (AI_AGENT_KEY).' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Calcular fecha y hora actual en tiempo real
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Mexico_City',
    });
    const currentYear = now.getFullYear();

    const systemPrompt = `[INSTRUCCIONES DE SISTEMA - CONTEXTO TEMPORAL Y OPERATIVO]
FECHA ACTUAL DEL SISTEMA: Hoy es ${formattedDate} (Año en curso: ${currentYear}).
REGLA TEMPORAL ESTRICTA: El año actual es ${currentYear}. NUNCA indiques ni asumas que estamos en 2024 ni en años anteriores. Todas tus evaluaciones de mercado, precios, inflación, tasas (CETES, FED, Banxico) y análisis de activos deben estar situadas en el presente (${currentYear}).

Eres Nexus AI, el estratega y analista financiero de élite de NEXUS FA (Wealth Management & Private Advisory).
Tu propósito es analizar activos (acciones globales, tecnológicas, energía como OXY, criptomonedas como BTC/ETH, renta fija como CETES y Bonos, FIBRAs inmobiliarias, oro y divisas) emulando la prudencia y agudeza de grandes estrategas como Warren Buffett y analistas de banca privada internacional.

Estilo de comunicación:
1. Respuestas de alto valor: concisas, fundamentadas, profesionales y fácilmente comprensibles para inversionistas calificados.
2. Formato estructurado: usa viñetas, negritas para puntos clave y cifras claras.
3. Recordatorio legal: Recuerda sutilmente al final que tus opiniones son con fines estratégicos/educativos y no constituyen asesoría legal o fiscal formal.

Contexto del inversionista:
- Perfil de Inversión / Tolerancia al Riesgo: ${riskProfile || 'Balanceado'}
- Portafolio Actual del Cliente:
${portfolioSummary || 'Sin activos registrados actualmente'}
[FIN DE INSTRUCCIONES]`;

    // Lista de modelos a intentar en orden de prioridad
    const candidateModels = [
      preferredModel,
      ...DEFAULT_CANDIDATE_MODELS,
    ].filter((m): m is string => Boolean(m) && typeof m === 'string' && m.trim().length > 0);

    // Deduplicar manteniendo el orden de preferencia
    const uniqueModels = Array.from(new Set(candidateModels));

    let lastError: any = null;
    let successfulText = '';
    let usedModel = '';

    const isFirstMessage = !history || history.length === 0;

    for (const modelCandidate of uniqueModels) {
      try {
        console.log(`[Nexus AI] Intentando generar respuesta con modelo: ${modelCandidate}`);
        const model = genAI.getGenerativeModel({ model: modelCandidate });

        const chat = model.startChat({
          history: history || [],
        });

        const finalMessage = isFirstMessage 
          ? `${systemPrompt}\n\nConsulta del usuario: ${message}` 
          : message;

        const result = await chat.sendMessage(finalMessage);
        const response = await result.response;
        const text = response.text();

        if (text) {
          successfulText = text;
          usedModel = modelCandidate;
          break; // Éxito: salimos del bucle
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[Nexus AI] Error con modelo ${modelCandidate}: ${errMsg}. Probando siguiente modelo de respaldo...`);
        // Si fue error de cuota (429 / RESOURCE_EXHAUSTED / model overloaded), continuamos con el siguiente candidato
      }
    }

    if (!successfulText) {
      const errorMsg = lastError?.message || 'Todos los modelos de IA se encuentran temporalmente saturados. Inténtalo de nuevo en unos momentos.';
      return res.status(503).json({
        error: `Servicio de IA temporalmente saturado: ${errorMsg}`,
      });
    }

    res.status(200).json({ 
      text: successfulText, 
      modelUsed: usedModel,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error general en endpoint AI chat:', error);
    res.status(500).json({ error: `Error del servidor: ${error.message || 'Error desconocido'}` });
  }
}
