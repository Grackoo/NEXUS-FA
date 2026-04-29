/**
 * Service to interact with Google Sheets via CSV exports (Read) 
 * and Google Apps Script (Write).
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRqbjaQj_qfvlF6Whe8wtxC6g83hWU75lMNDudCU1_Vl3Hcs22GWevoTreKY64K2S4sA/exec';

// These are the real CSV URLs constructed from the user's published sheet
export const SHEET_URLS = {
  // Solo conservamos CLIENTS_DATA para la lista de usuarios. El portafolio y operaciones ahora vienen del servidor.
  CLIENTS_DATA: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=1509214802&single=true&output=csv',
};

const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes cache

export function invalidateCache() {
  cache.clear();
}

export async function fetchCsvData(url: string) {
  if (!url) return [];
  
  const cached = cache.get(url);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }
  try {
    const uniqueUrl = url.includes('?') ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`;
    const response = await fetch(uniqueUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    const text = await response.text();
    const parseCsvRow = (row: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
        else current += char;
      }
      result.push(current);
      return result;
    };
    
    const rows = text.split('\n').filter(r => r.trim() !== '').map(parseCsvRow);
    const headers = rows[0];
    const parsedData = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = row[i]?.trim();
      });
      return obj;
    });

    cache.set(url, { data: parsedData, timestamp: Date.now() });
    return parsedData;
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return [];
  }
}

export async function fetchPortfolioData(clientId: string) {
  try {
    const url = `${SCRIPT_URL}?action=getPortfolio&clientId=${encodeURIComponent(clientId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // En Apps Script, a veces hay redirects, fetch los sigue automáticamente
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('La respuesta de Apps Script no es JSON válido:', text);
      return null;
    }
  } catch (error) {
    console.error('Error fetching portfolio data from GAS:', error);
    return null;
  }
}

export async function submitOperation(data: any) {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script requires no-cors sometimes for simple POSTs
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        date: data.date || new Date().toISOString().split('T')[0]
      }),
    });
    invalidateCache();
    return true; // Simple confirmation
  } catch (error) {
    console.error('Error submitting operation:', error);
    return false;
  }
}

export async function deletePosition(clientId: string, ticker: string, assetType: string) {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        type: 'Delete',
        ticker,
        assetType,
        Cliente_ID: clientId,
        Tipo_Operacion: 'Delete',
        Ticker: ticker,
        Tipo_Activo: assetType,
        date: new Date().toISOString().split('T')[0],
      }),
    });
    invalidateCache();
    return true;
  } catch (error) {
    console.error('Error deleting position:', error);
    return false;
  }
}
