'use client';

import React, { useState } from 'react';
import { Creative, Scene } from '@/types/creative';
import { saveScene, saveCreative } from '@/lib/storage';
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  Check, 
  Copy, 
  Zap, 
  FileSpreadsheet, 
  Sliders, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface AiScriptAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  creative: Creative | null;
  onCreativeUpdated: () => void;
  onScenesUpdated: () => void;
}

export const AiScriptAssistant: React.FC<AiScriptAssistantProps> = ({
  isOpen,
  onClose,
  creative,
  onCreativeUpdated,
  onScenesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'hooks' | 'scenes' | 'polish'>('hooks');
  const [promptInput, setPromptInput] = useState<string>('');
  const [contextInput, setContextInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Results
  const [generatedHooks, setGeneratedHooks] = useState<Array<{ type: string; speech: string; visual: string }>>([]);
  const [generatedScenes, setGeneratedScenes] = useState<Array<any>>([]);
  const [polishedScript, setPolishedScript] = useState<string | null>(null);
  const [appliedHookIndex, setAppliedHookIndex] = useState<number | null>(null);
  const [appliedScenesSuccess, setAppliedScenesSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateHooks = async () => {
    if (!promptInput.trim()) {
      setErrorMsg('Informe o tema ou produto para gerar os ganchos.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/creative-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-hooks',
          prompt: promptInput,
          context: contextInput,
          creativeTitle: creative?.title,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedHooks(data.hooks || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao gerar ganchos com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateScenes = async () => {
    if (!promptInput.trim()) {
      setErrorMsg('Informe a ideia ou briefing do criativo.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/creative-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-scenes',
          prompt: promptInput,
          context: contextInput,
          creativeTitle: creative?.title,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedScenes(data.scenes || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao gerar cenas do roteiro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePolishScript = async () => {
    const textToPolish = promptInput.trim() || creative?.script || '';
    if (!textToPolish) {
      setErrorMsg('Cole o roteiro ou selecione um criativo com texto.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/creative-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'polish-script',
          prompt: textToPolish,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPolishedScript(data.polishedText || '');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao aprimorar roteiro.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyHookToCreative = async (hookText: string, index: number) => {
    if (!creative) return;
    const updated = {
      ...creative,
      hook: hookText,
      updatedAt: new Date().toISOString(),
    };
    await saveCreative(updated);
    setAppliedHookIndex(index);
    onCreativeUpdated();
    setTimeout(() => setAppliedHookIndex(null), 2000);
  };

  const applyScenesToCreative = async () => {
    if (!creative || generatedScenes.length === 0) return;
    // Save each scene
    for (let i = 0; i < generatedScenes.length; i++) {
      const g = generatedScenes[i];
      const newScene: Scene = {
        id: `sc_${Date.now()}_${i}`,
        creativeId: creative.id,
        projectId: creative.projectId,
        order: i + 1,
        title: g.title || `Cena ${i + 1}`,
        speech: g.speech || '',
        visualInstruction: g.visualInstruction || '',
        brollInstruction: g.brollInstruction || '',
        notes: g.notes || '',
        ownerId: creative.ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveScene(newScene);
    }

    // Update creative status to scripted
    await saveCreative({
      ...creative,
      status: 'scripted',
      scenesCount: generatedScenes.length,
      updatedAt: new Date().toISOString(),
    });

    setAppliedScenesSuccess(true);
    onCreativeUpdated();
    onScenesUpdated();
    setTimeout(() => {
      setAppliedScenesSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-t-[24px] sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-neutral-200 relative max-h-[92vh] flex flex-col pb-safe">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base">Assistente Criativo (IA)</h3>
              <p className="text-[11px] sm:text-xs text-neutral-500">
                Gere ganchos magnéticos, estruture cenas e otimize a fala.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 my-3 sm:my-4 p-1 rounded-xl bg-neutral-100 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => { setActiveTab('hooks'); setErrorMsg(null); }}
            className={`flex-1 min-w-[100px] py-2.5 sm:py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'hooks' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="whitespace-nowrap">Ganchos (3s)</span>
          </button>
          <button
            onClick={() => { setActiveTab('scenes'); setErrorMsg(null); }}
            className={`flex-1 min-w-[100px] py-2.5 sm:py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'scenes' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="whitespace-nowrap">Roteiro</span>
          </button>
          <button
            onClick={() => { setActiveTab('polish'); setErrorMsg(null); }}
            className={`flex-1 min-w-[100px] py-2.5 sm:py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'polish' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="whitespace-nowrap">Teleprompter</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              {activeTab === 'hooks' && 'Tema / Produto / Ângulo do Anúncio:'}
              {activeTab === 'scenes' && 'Ideia central / Objeção a quebrar / Oferta:'}
              {activeTab === 'polish' && 'Texto do roteiro a ser aprimorado:'}
            </label>
            <textarea
              rows={activeTab === 'polish' ? 3 : 2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={
                activeTab === 'hooks'
                  ? 'Ex: Aplicativo de produtividade para pessoas com TDAH que querem parar de procrastinar...'
                  : activeTab === 'scenes'
                  ? 'Ex: Criativo mostrando o antes e depois de organizar criativos em vídeo no celular sem travar...'
                  : 'Cole o roteiro aqui para deixá-lo mais fluido...'
              }
              className="w-full text-sm sm:text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {activeTab !== 'polish' && (
            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">
                Contexto Adicional (Público-alvo, Formato, etc):
              </label>
              <input
                type="text"
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="Ex: Meta Ads, Tom descontraído, público 25-45 anos, UGC..."
                className="w-full text-sm sm:text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (activeTab === 'hooks') handleGenerateHooks();
                if (activeTab === 'scenes') handleGenerateScenes();
                if (activeTab === 'polish') handlePolishScript();
              }}
              disabled={isLoading}
              className="w-full sm:w-auto justify-center px-5 py-3 sm:py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Gerando com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Gerar Sugestões</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pt-3 border-t border-neutral-100 pr-1">
          {/* Hooks Results */}
          {activeTab === 'hooks' && generatedHooks.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Ganchos Gerados ({generatedHooks.length})
              </h4>
              {generatedHooks.map((h, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:bg-white hover:border-amber-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {h.type}
                    </span>
                    {creative && (
                      <button
                        onClick={() => applyHookToCreative(h.speech, i)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1 transition-colors"
                      >
                        {appliedHookIndex === i ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Aplicado!</span>
                          </>
                        ) : (
                          <span>Usar no Criativo</span>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-bold text-neutral-900">&ldquo;{h.speech}&rdquo;</p>
                  {h.visual && (
                    <p className="text-[11px] text-neutral-500 italic">Visual: {h.visual}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Scenes Results */}
          {activeTab === 'scenes' && generatedScenes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Roteiro Completo ({generatedScenes.length} Cenas)
                </h4>
                {creative && (
                  <button
                    onClick={applyScenesToCreative}
                    disabled={appliedScenesSuccess}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {appliedScenesSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Cenas Adicionadas!</span>
                      </>
                    ) : (
                      <span>Importar Cenas para este Criativo</span>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {generatedScenes.map((sc, i) => (
                  <div key={i} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{sc.title}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">~{sc.estimatedSeconds}s</span>
                    </div>
                    <p className="text-neutral-800 font-medium whitespace-pre-line">&ldquo;{sc.speech}&rdquo;</p>
                    {sc.visualInstruction && (
                      <div className="text-[11px] text-neutral-500">Câmera: {sc.visualInstruction}</div>
                    )}
                    {sc.brollInstruction && (
                      <div className="text-[11px] text-emerald-700">B-Roll: {sc.brollInstruction}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Polish Script Results */}
          {activeTab === 'polish' && polishedScript && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Versão Otimizada para Teleprompter
              </h4>
              <div className="p-4 rounded-xl bg-neutral-900 text-white text-xs leading-relaxed font-sans whitespace-pre-line">
                {polishedScript}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(polishedScript);
                    alert('Roteiro copiado para a área de transferência!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Roteiro</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
