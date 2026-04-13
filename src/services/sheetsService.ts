/**
 * Service to interact with Google Sheets via CSV exports (Read) 
 * and Google Apps Script (Write).
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDHJhTsmvrbnBFwcLMaIzJg594iLR3258V0t2hE9bCJ98_dTCpjQu12nf8YA2M3ZvQJQ/exec';

// These are the real CSV URLs constructed from the user's published sheet
export const SHEET_URLS = {
  PORTFOLIO_SUMMARY: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=96904810&single=true&output=csv',
  CURRENCY_TRACKER: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=1688734912&single=true&output=csv',
  OPERACIONES: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=418925467&single=true&output=csv',
  // URL corregida con el GID 1509214802 detectado en tu captura
  CLIENTS_DATA: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=1509214802&single=true&output=csv',
  // Nuevas URLs de categorías
  SUMMARY_STOCKS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=1142203439&single=true&output=csv',
  SUMMARY_ETFS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=643930586&single=true&output=csv',
  SUMMARY_CRYPTO: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=230075770&single=true&output=csv',
  SUMMARY_FIXED_INCOME: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=810681393&single=true&output=csv',
  SUMMARY_FIBRAS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=831142110&single=true&output=csv',
  SUMMARY_COMMODITIES: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=456974640&single=true&output=csv',
  SUMMARY_FOREX: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMbHAoAnLIzHBO7iGu9ETipHcbSXmvBuc-bsR4vBsaciYzmipRlmk36kLz83miN692Dkgt7MyuLnLK/pub?gid=1831667518&single=true&output=csv'
};

export async function fetchCsvData(url: string) {
  if (!url) return [];
  try {
    const response = await fetch(url);
    const text = await response.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = row[i]?.trim();
      });
      return obj;
    });
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return [];
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
        date: new Date().toISOString().split('T')[0]
      }),
    });
    return true; // Simple confirmation
  } catch (error) {
    console.error('Error submitting operation:', error);
    return false;
  }
}
