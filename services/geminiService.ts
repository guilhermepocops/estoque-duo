import { GoogleGenAI } from "@google/genai";
import { InventoryItem, PurchaseRecord } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRecipeSuggestion = async (inventory: InventoryItem[]) => {
  const availableItems = inventory
    .filter(i => i.quantity > 0)
    .map(i => `${i.quantity} ${i.unit} de ${i.name}`)
    .join(', ');

  const prompt = `
    Atue como um chef de cozinha criativo e prático.
    Eu tenho os seguintes ingredientes em casa: ${availableItems}.
    
    Sugira 2 receitas simples que eu possa fazer principalmente com esses itens. 
    Se faltar algum ingrediente comum (como sal, óleo, temperos básicos), assuma que eu tenho.
    Se faltar um ingrediente principal, avise.
    
    Formate a resposta em Markdown limpo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar receita:", error);
    return "Desculpe, não consegui gerar uma receita agora. Verifique sua conexão ou tente novamente mais tarde.";
  }
};

export const analyzePriceTrends = async (history: PurchaseRecord[]) => {
  // Simplify history for the prompt to save tokens
  const historySummary = history.map(h => `${h.itemName}: R$${h.price} no ${h.storeName} (${h.date})`).join('\n');

  const prompt = `
    Analise este histórico de compras domésticas:
    ${historySummary}

    Forneça 3 insights curtos e diretos (máximo 1 frase cada) sobre onde economizar. 
    Exemplo: "O Leite está 20% mais barato no Mercado A."
    
    Formate como uma lista simples HTML (<ul><li>...</li></ul>) sem markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao analisar preços:", error);
    return "<ul><li>Não foi possível analisar os preços no momento.</li></ul>";
  }
};
