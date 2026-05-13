/**
 * Service to interact with Google Sheets via CSV exports (Read) 
 * and Google Apps Script (Write).
 */

import CryptoJS from 'crypto-js';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRqbjaQj_qfvlF6Whe8wtxC6g83hWU75lMNDudCU1_Vl3Hcs22GWevoTreKY64K2S4sA/exec';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default_nexus_key_2026';

export const encryptData = (text: string) => {
  if (!text) return text;
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (e) {
    return text;
  }
};

export const decryptData = (ciphertext: string) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || ciphertext;
  } catch (e) {
    return ciphertext;
  }
};

// These are the real CSV URLs constructed from the user's published sheet
export const SHEET_URLS = {
  // Solo conservamos CLIENTS_DATA y CURRENCY_TRACKER. El portafolio y operaciones ahora vienen del servidor.
  CLIENTS_DATA: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=1509214802&single=true&output=csv',
  CURRENCY_TRACKER: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=1688734912&single=true&output=csv',
};

export function invalidateCache() {
  // Caché manejado ahora por useCachedData
}

export async function fetchCsvData(url: string) {
  if (!url) return [];
  
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
        let val = row[i]?.trim();
        // Intentar desencriptar el nombre si aplica
        if (header.trim().toLowerCase() === 'nombre' || header.trim().toLowerCase() === 'name') {
           val = decryptData(val);
        }
        obj[header.trim()] = val;
      });
      return obj;
    });

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
      const parsed = JSON.parse(text);
      if (parsed && parsed.operations) {
        parsed.operations = parsed.operations.map((op: any) => ({
          ...op,
          thesis: decryptData(op.thesis)
        }));
      }
      return parsed;
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
    const orderId = data.orderId || `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script requires no-cors sometimes for simple POSTs
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        orderId,
        Nombre: encryptData(data.Nombre), // En caso de que se cree un cliente
        Tesis_Inversion: encryptData(data.Tesis_Inversion),
        thesis: encryptData(data.thesis),
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

export async function updateKYC(clientId: string, data: { investmentHorizon: string, liquidityNeeds: string, lastCommunication: string }) {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        type: 'UpdateKYC',
        ...data
      }),
    });
    invalidateCache();
    return true;
  } catch (error) {
    console.error('Error updating KYC:', error);
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

export async function fetchGoals(clientId: string) {
  try {
    const url = `${SCRIPT_URL}?action=getGoals&clientId=${encodeURIComponent(clientId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      return parsed.goals || [];
    } catch (e) {
      return [];
    }
  } catch (error) {
    console.error('Error fetching goals from GAS:', error);
    return [];
  }
}

export async function logAudit(action: string, orderId: string, details: any) {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'AuditLog',
        action,
        orderId,
        details,
        date: new Date().toISOString()
      }),
    });
    return true;
  } catch (error) {
    console.error('Error logging audit:', error);
    return false;
  }
}
