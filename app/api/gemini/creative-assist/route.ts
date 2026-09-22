import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada no ambiente.' },
        { status: 500 }
      );
    }

    const { action, prompt, creativeTitle, context } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = `Você é um Diretor Criativo e Copywriter Especialista em Marketing de Resposta Direta (Direct Response, Meta Ads, TikTok Ads, YouTube Shorts, Reels).
Seu objetivo é criar roteiros e ganchos altamente envolventes, que prendem a atenção nos primeiros 3 segundos, mantêm a retenção alta e geram conversão imediata.
Responda sempre em português brasileiro de forma direta, persuasiva, moderna e prática para quem vai gravar.`;

    if (action === 'generate-hooks') {
      const promptText = `Crie 5 variações de ganchos (hooks) magnéticos para os primeiros 3 segundos de um vídeo anúncio sobre: "${prompt}".
Contexto/Produto: ${context || 'Geral'}.

Para cada variação, forneça:
1. O texto exato da fala (Speech)
2. Tipo do gancho (ex: Pattern Interrupt, Curiosidade Extrema, Problema & Dor, POV / História, Benefício Contraintuitivo)
3. Indicação visual recomendada (o que fazer na câmera).

Retorne em formato JSON no esquema:
{
  "hooks": [
    {
      "type": "Pattern Interrupt",
      "speech": "...",
      "visual": "..."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '{}';
      return NextResponse.json(JSON.parse(text));
    }

    if (action === 'generate-scenes') {
      const promptText = `Desenvolva um roteiro completo estruturado cena a cena para o criativo "${creativeTitle || prompt}".
Ideia / Descrição base: "${prompt}".
${context ? `Detalhes adicionais: ${context}` : ''}

Divida o criativo em 4 a 6 cenas cronológicas lógicas (ex: Gancho, Problema, Solução, Demonstração/B-Roll, Oferta/CTA).
Para cada cena, defina:
- title: título descritivo com tempo estimado (ex: "Cena 1 - Gancho Disruptivo (0-3s)")
- speech: o texto exato falado pela pessoa
- visualInstruction: o que a pessoa faz, enquadramento e expressões
- brollInstruction: takes de corte, inserção de tela ou elementos gráficos
- notes: dica de entonação ou ritmo de fala
- estimatedSeconds: duração estimada em segundos (número)

Retorne em formato JSON no esquema:
{
  "hook": "Resumo do gancho inicial em 1 frase",
  "scenes": [
    {
      "order": 1,
      "title": "Gancho / Hook (0-3s)",
      "speech": "...",
      "visualInstruction": "...",
      "brollInstruction": "...",
      "notes": "...",
      "estimatedSeconds": 4
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '{}';
      return NextResponse.json(JSON.parse(text));
    }

    if (action === 'polish-script') {
      const promptText = `Aprimore o ritmo e a fluidez deste roteiro para fala no Teleprompter, deixando-o mais natural, conversacional e dinâmico, sem palavras difíceis de pronunciar:
"${prompt}"

Retorne em formato JSON no esquema:
{
  "polishedText": "...",
  "improvements": ["melhoria 1", "melhoria 2"],
  "estimatedPaceWordsPerMin": 140
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '{}';
      return NextResponse.json(JSON.parse(text));
    }

    return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in creative-assist route:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao processar requisição com Gemini.' },
      { status: 500 }
    );
  }
}
