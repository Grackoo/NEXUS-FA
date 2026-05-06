import { useCallback } from 'react';
import { fetchCsvData, fetchPortfolioData } from '../services/sheetsService';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * @hook useCachedData
 * @description Envuelve las llamadas a sheetsService.ts implementando una caché en localStorage
 * que expira cada 5 minutos para optimizar la carga y evitar redundancia de peticiones.
 */
export function useCachedData() {
  /**
   * Obtiene datos de localStorage si son válidos
   */
  const getFromCache = (key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error('Error reading from localStorage cache', e);
    }
    return null;
  };

  /**
   * Guarda datos en localStorage con timestamp
   */
  const saveToCache = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
      console.error('Error writing to localStorage cache', e);
    }
  };

  /**
   * Envuelve fetchCsvData
   */
  const fetchCsvCached = useCallback(async (url: string) => {
    const cacheKey = `csv_${url}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const data = await fetchCsvData(url);
    if (data && data.length > 0) {
      saveToCache(cacheKey, data);
    }
    return data;
  }, []);

  /**
   * Envuelve fetchPortfolioData
   */
  const fetchPortfolioCached = useCallback(async (clientId: string) => {
    const cacheKey = `portfolio_${clientId}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const data = await fetchPortfolioData(clientId);
    if (data) {
      saveToCache(cacheKey, data);
    }
    return data;
  }, []);

  /**
   * Limpia la caché explícitamente (útil después de una operación de guardado)
   */
  const invalidateCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('csv_') || key.startsWith('portfolio_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error invalidating localStorage cache', e);
    }
  }, []);

  return { fetchCsvCached, fetchPortfolioCached, invalidateCache };
}
