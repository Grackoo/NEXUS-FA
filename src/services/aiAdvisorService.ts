export interface ExecutiveAINote {
  note: string;
  updatedAt: string;
  triggerType: 'buy' | 'manual' | 'initial';
  ticker?: string;
  shares?: number;
  price?: number;
  currency?: 'USD' | 'MXN';
  assetType?: string;
  modelUsed?: string;
}

const STORAGE_PREFIX = 'nexus_ai_executive_note_';

export const getExecutiveAINote = (clientId: string): ExecutiveAINote | null => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${clientId}`) || localStorage.getItem(`${STORAGE_PREFIX}global`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error al recuperar nota de Nexus AI:', e);
  }
  return null;
};

export const saveExecutiveAINote = (clientId: string, noteData: ExecutiveAINote) => {
  try {
    const jsonStr = JSON.stringify(noteData);
    localStorage.setItem(`${STORAGE_PREFIX}${clientId}`, jsonStr);
    localStorage.setItem(`${STORAGE_PREFIX}global`, jsonStr);
    window.dispatchEvent(new CustomEvent('nexus_ai_note_updated', { detail: noteData }));
  } catch (e) {
    console.error('Error al guardar nota de Nexus AI:', e);
  }
};

export interface GenerateBuyNoteParams {
  clientId: string;
  clientName?: string;
  ticker: string;
  shares: number;
  price: number;
  currency: 'USD' | 'MXN';
  assetType: string;
  portfolioSummary?: string;
  riskProfile?: string;
}

export const generateExecutiveAINoteOnBuy = async (params: GenerateBuyNoteParams): Promise<ExecutiveAINote> => {
  const { clientId, clientName, ticker, shares, price, currency, assetType, portfolioSummary, riskProfile } = params;

  const prompt = `[ACCIÓN OPERATIVA: REGISTRO DE COMPRA DE ACTIVO]
Se acaba de registrar una orden de COMPRA en la cuenta del inversionista ${clientName || 'Cliente'}:
- Activo: ${ticker} (${assetType})
- Cantidad: ${shares} títulos / unidades
- Precio de Ejecución: ${price} ${currency}

Instrucción: Como Nexus AI, genera una Nota Ejecutiva Táctica oficial (máximo 140-160 palabras) para el Resumen Ejecutivo del cliente.
Debes abordar con precisión profesional:
1. Razón estratégica y timing de la compra en el contexto de mercado de la fecha actual.
2. Impacto en la diversificación y balance del portafolio.
3. Próximo nivel de referencia clave (nivel de soporte o toma de utilidades sugerido).
Mantén un tono de wealth manager institucional, conciso y de alto valor.`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        riskProfile: riskProfile || 'Moderado / Crecimiento',
        portfolioSummary: portfolioSummary || `- Compra reciente: ${shares} de ${ticker} a $${price} ${currency}`,
        preferredModel: 'gemini-2.5-flash',
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || 'No se pudo generar la nota ejecutiva con IA');
    }

    const data = await response.json();
    const newNote: ExecutiveAINote = {
      note: data.text,
      updatedAt: new Date().toISOString(),
      triggerType: 'buy',
      ticker,
      shares,
      price,
      currency,
      assetType,
      modelUsed: data.modelUsed || 'Gemini',
    };

    saveExecutiveAINote(clientId, newNote);
    return newNote;
  } catch (error: any) {
    console.error('Error generando nota ejecutiva tras compra:', error);
    // Fallback inteligente en caso de desconexión temporal de la API
    const fallbackNote: ExecutiveAINote = {
      note: `Se registró exitosamente la adquisición de ${shares} títulos de ${ticker} (${assetType}) a ${price} ${currency}. La posición refuerza la exposición estratégica del portafolio. Recomendamos monitorear los rangos de soporte y mantener disciplina de asignación conforme al perfil de riesgo.`,
      updatedAt: new Date().toISOString(),
      triggerType: 'buy',
      ticker,
      shares,
      price,
      currency,
      assetType,
      modelUsed: 'Nexus Tactical Rules',
    };
    saveExecutiveAINote(clientId, fallbackNote);
    return fallbackNote;
  }
};

export const generateGeneralPortfolioAINote = async (
  clientId: string,
  clientName: string,
  portfolioSummary: string,
  riskProfile?: string
): Promise<ExecutiveAINote> => {
  const prompt = `[SOLICITUD: ACTUALIZACIÓN DE RESUMEN EJECUTIVO GENERAL]
Analiza el portafolio actual del inversionista ${clientName || 'Cliente'}.
Genera una Nota Estratégica Ejecutiva (máximo 150 palabras) destacando la salud del portafolio en la fecha de hoy, la ponderación entre renta fija, renta variable y liquidez, y una recomendación táctica puntual para maximizar rendimientos controlando la volatilidad.`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: prompt,
      riskProfile: riskProfile || 'Balanceado',
      portfolioSummary: portfolioSummary || 'Sin activos registrados',
      preferredModel: 'gemini-2.0-flash',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Error al conectar con Nexus AI');
  }

  const data = await response.json();
  const newNote: ExecutiveAINote = {
    note: data.text,
    updatedAt: new Date().toISOString(),
    triggerType: 'manual',
    modelUsed: data.modelUsed || 'Gemini',
  };

  saveExecutiveAINote(clientId, newNote);
  return newNote;
};
