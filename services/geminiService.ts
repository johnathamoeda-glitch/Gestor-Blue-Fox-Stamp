import { GoogleGenAI } from "@google/genai";
import { Order } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePaymentReminder = async (order: Order): Promise<string> => {
  const remaining = order.totalValue - order.paidValue;
  
  let paymentDeadlineInfo = "";
  if (remaining > 0 && order.remainingPaymentDate) {
    const date = new Date(order.remainingPaymentDate).toLocaleDateString('pt-BR');
    paymentDeadlineInfo = `- A data combinada para o pagamento do restante foi: ${date}. Tente mencionar isso sutilmente se a data estiver próxima ou já passou.`;
  }

  const prompt = `
    Aja como um assistente educado de uma estamparia chamada "Gestor Blue Fox Stamp".
    Escreva uma mensagem curta e amigável para WhatsApp para o cliente ${order.customerName}.
    
    Contexto:
    - O pedido consiste em: ${order.description}.
    - O status atual é: ${order.status}.
    - Valor total: R$ ${order.totalValue.toFixed(2)}.
    - Já foi pago: R$ ${order.paidValue.toFixed(2)}.
    - Falta pagar: R$ ${remaining.toFixed(2)}.
    ${paymentDeadlineInfo}
    
    Objetivo: Lembrar gentilmente sobre o pagamento restante ou avisar que o pedido está pronto/entregue e é necessário quitar o saldo.
    Se o pedido estiver "Pronto", avise que pode buscar.
    Se estiver "Entregue" e ainda dever, cobre gentilmente.
    Não use hashtags. Mantenha profissional mas próximo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a mensagem.";
  } catch (error) {
    console.error("Erro ao gerar mensagem com Gemini:", error);
    return "Erro ao conectar com a IA. Tente novamente.";
  }
};

export const analyzeOrderRisk = async (orders: Order[]): Promise<string> => {
    // A simple analysis of the business health based on current orders
    const unpaidOrders = orders.filter(o => (o.totalValue - o.paidValue) > 0);
    const totalPending = unpaidOrders.reduce((acc, curr) => acc + (curr.totalValue - curr.paidValue), 0);
    
    const prompt = `
      Analise estes dados da minha estamparia:
      - Total de pedidos com saldo devedor: ${unpaidOrders.length}
      - Valor total a receber: R$ ${totalPending.toFixed(2)}
      
      Dê 3 dicas curtas e práticas de como melhorar o fluxo de caixa e garantir esses recebimentos. Seja direto. Use bullet points.
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text || "Sem análise disponível.";
      } catch (error) {
        console.error(error);
        return "Erro ao gerar análise.";
      }
}