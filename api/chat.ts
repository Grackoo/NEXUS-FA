import { GoogleGenerativeAI } from '@google/generative-ai';

// Cache en memoria para los modelos soportados por la API key
let cachedAvailableModels: { models: string[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

async function getAvailableModelNames(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedAvailableModels && (now - cachedAvailableModels.timestamp) < CACHE_TTL_MS) {
    return cachedAvailableModels.models;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const supported = data.models
          .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));
        if (supported.length > 0) {
          cachedAvailableModels = { models: supported, timestamp: now };
          return supported;
        }
      }
    }
  } catch (e) {
    console.warn('[Nexus AI] No se pudo obtener listado dinámico de modelos de Google API:', e);
  }

  // Fallback con modelos vigentes
  return ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.8-flash', 'gemini-1.5-flash'];
}

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
      return res.status(500).json({ error: 'La API Key de Nexus AI (AI_AGENT_KEY) no está configurada en las variables de entorno de Vercel.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Fecha actual en tiempo real
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

    // 1. Obtener los modelos realmente disponibles para esta clave en Google AI Studio
    const availableFromApi = await getAvailableModelNames(apiKey);

    // 2. Orden de preferencia prioritario
    const preferredPriority = [
      preferredModel,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-1.5-flash',
    ].filter((m): m is string => Boolean(m) && typeof m === 'string' && m.trim().length > 0 && m !== 'auto');

    // Combinar modelos preferidos que existan en la API + los demás disponibles
    const matchedPreferred = preferredPriority.filter(m => availableFromApi.includes(m));
    const remainingAvailable = availableFromApi.filter(m => !preferredPriority.includes(m));
    
    // Si ninguno coincidió, usamos los disponibles o la prioridad
    const candidateModels = Array.from(new Set([
      ...matchedPreferred,
      ...preferredPriority,
      ...remainingAvailable
    ]));

    let lastError: any = null;
    let successfulText = '';
    let usedModel = '';
    let hadQuotaError = false;

    const isFirstMessage = !history || history.length === 0;

    for (const modelCandidate of candidateModels) {
      try {
        console.log(`[Nexus AI] Consultando modelo: ${modelCandidate}`);
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
          break; // Éxito
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || String(err)).toLowerCase();
        console.warn(`[Nexus AI] Fallo con ${modelCandidate}:`, err?.message);

        if (errMsg.includes('429') || errMsg.includes('resource_exhausted') || errMsg.includes('quota') || errMsg.includes('too many requests')) {
          hadQuotaError = true;
        }
        // Continuamos con el siguiente modelo disponible
      }
    }

    if (!successfulText) {
      if (hadQuotaError) {
        return res.status(429).json({
          error: 'Has alcanzado el límite de solicitudes gratuitas de tu API Key de Gemini en Google AI Studio (Error 429: Cuota temporalmente agotada). Por favor espera un minuto antes de volver a consultar.',
        });
      }

      const msg = lastError?.message || 'No se pudo conectar con los servidores de Gemini.';
      return res.status(503).json({
        error: `Servicio de IA no disponible: ${msg}`,
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
