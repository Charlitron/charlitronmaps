
import { GoogleGenAI, Type } from "@google/genai";

// Inicialización centralizada usando el Secret API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSupplierQuery = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User query: "${query}". Respond as a futuristic industrial assistant in SLP. 15 words max.`,
      config: { temperature: 0.7 },
    });
    return response.text || "Radar activo. Escaneando sector...";
  } catch (error) {
    return "Sincronización local activa.";
  }
};

/**
 * Resuelve coordenadas con precisión máxima.
 * Optimizado para direcciones específicas de SLP como 'Lanzagorta 330'.
 */
export const resolveLocationFromText = async (locationInput: string) => {
  try {
    // 1. Detección de links (Prioridad 1: Coordenadas directas del usuario)
    const desktopRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const desktopMatch = locationInput.match(desktopRegex);
    if (desktopMatch) {
      return { lat: parseFloat(desktopMatch[1]), lng: parseFloat(desktopMatch[2]) };
    }

    const mobileLatRegex = /!3d(-?\d+\.\d+)/;
    const mobileLngRegex = /!4d(-?\d+\.\d+)/;
    const mLat = locationInput.match(mobileLatRegex);
    const mLng = locationInput.match(mobileLngRegex);
    if (mLat && mLng) {
      return { lat: parseFloat(mLat[1]), lng: parseFloat(mLng[1]) };
    }

    // 2. IA con Google Maps Grounding (Prioridad 2: Resolución de dirección textual)
    // Utilizamos gemini-2.5-flash porque es el modelo optimizado para herramientas de Mapas.
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find the PRECISE entrance coordinates for the specific building number: "${locationInput}, San Luis Potosí, México".
        If the address is "Lanzagorta 330", do NOT return the street center. Return the exact point of number 330.
        FORMAT: [lat, lng]`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: 22.1567, 
                longitude: -100.9855
              }
            }
          }
        },
      });

      const text = response.text || "";
      // Regex mejorado para capturar arreglos [lat, lng] o coordenadas sueltas
      const coordsMatch = text.match(/\[?(-?\d+\.\d+),\s*(-?\d+\.\d+)\]?/);
      
      if (coordsMatch) {
        const lat = parseFloat(coordsMatch[1]);
        const lng = parseFloat(coordsMatch[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log(`Radar Calibrado con éxito: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }
    } catch (innerError) {
      console.warn("Error en Maps Grounding, usando fallback rápido...");
      // Fallback si la herramienta de mapas no está disponible
      const fallback = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Coordenadas exactas para "${locationInput}, SLP, México". Solo JSON: {"lat": 0, "lng": 0}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(fallback.text || '{"lat": 22.1567, "lng": -100.9855}');
    }

    return { lat: 22.1567, lng: -100.9855 }; 
  } catch (error) {
    console.error("Geocoding Error:", error);
    return { lat: 22.1567, lng: -100.9855 }; 
  }
};

export const getSupplierInsights = async (businessName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Futuristic industrial insight for "${businessName}". Format: JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            efficiency: { type: Type.NUMBER },
            carbon: { type: Type.NUMBER },
            dominance: { type: Type.NUMBER }
          },
          required: ["insight", "efficiency", "carbon", "dominance"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { insight: "Data stream offline.", efficiency: 0, carbon: 0, dominance: 0 };
  }
};
