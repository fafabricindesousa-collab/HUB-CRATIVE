'use client';

import React, { useState } from 'react';
import { Project, Creative, CreativeStatus } from '@/types/creative';
import { saveCreative, saveScene } from '@/lib/storage';
import { auth } from '@/lib/firebase';
import { X, Film, Sparkles } from 'lucide-react';

interface CreativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId?: string;
  onCreativeSaved: (creative: Creative) => void;
  existingCreative?: Creative | null;
}

const STATUS_OPTIONS: { value: CreativeStatus; label: string }[] = [
  { value: 'idea', label: '💡 Ideia / Brainstorm' },
  { value: 'scripted', label: '📝 Roteirizado' },
  { value: 'recording', label: '🎙️ Em Gravação' },
  { value: 'done', label: '✂️ Pronto / Editado' },
  { value: 'approved', label: '✅ Aprovado para Veiculação' },
];

export const CreativeModal: React.FC<CreativeModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  onCreativeSaved,
  existingCreative,
}) => {
  const [projectId, setProjectId] = useState<string>(
    existingCreative?.projectId || defaultProjectId || projects[0]?.id || ''
  );
  const [title, setTitle] = useState<string>(existingCreative?.title || '');
  const [code, setCode] = useState<string>(existingCreative?.code || '');
  const [hook, setHook] = useState<string>(existingCreative?.hook || '');
  const [script, setScript] = useState<string>(existingCreative?.script || '');
  const [status, setStatus] = useState<CreativeStatus>(existingCreative?.status || 'idea');
  const [tagInput, setTagInput] = useState<string>(existingCreative?.tags?.join(', ') || 'Meta Ads, Direct Response');

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    const user = auth.currentUser;
    const projectPrefix = currentProject?.code || 'CR';
    const computedCode = code.trim() || `${projectPrefix}-${(currentProject?.creativeCounter || 0) + 1}`;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const creativeId = existingCreative?.id || `cr_${Date.now()}`;

    const creative: Creative = {
      id: creativeId,
      projectId,
      code: computedCode,
      title: title.trim(),
      hook: hook.trim(),
      script: script.trim(),
      status,
      tags,
      scenesCount: existingCreative?.scenesCount || 1,
      hasAudio: existingCreative?.hasAudio || false,
      approvedAssetsCount: existingCreative?.approvedAssetsCount || 0,
      ownerId: user?.uid || 'demo_user',
      createdAt: existingCreative?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCreative(creative);

    // If new creative, generate initial Scene 1 automatically
    if (!existingCreative) {
      await saveScene({
        id: `sc_${Date.now()}_1`,
        creativeId,
        projectId,
        order: 1,
        title: 'Gancho / Hook (0-3s)',
        speech: hook.trim() || 'Digite a primeira fala de impacto do vídeo...',
        visualInstruction: 'Olhar direto na lente, aproximação de câmera',
        brollInstruction: 'Inserção de elemento chamativo na tela',
        notes: 'Prender atenção no primeiro frame',
        ownerId: user?.uid || 'demo_user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    onCreativeSaved(creative);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-t-[24px] sm:rounded-[20px] max-w-lg w-full p-5 sm:p-6 shadow-[0_8px_30px_rgba(10,10,10,0.16)] border border-[#E5E5E5] relative max-h-[92vh] overflow-y-auto pb-safe">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#eff5ff] text-[#3478F6] border border-[#d6e5fd] flex items-center justify-center shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A1A] text-base sm:text-lg tracking-tight">
              {existingCreative ? 'Editar Criativo' : 'Novo Vídeo / Criativo'}
            </h3>
            <p className="text-xs text-[#737373]">Defina o gancho, roteiro e status de produção</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Campanha / Projeto *</label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all font-medium"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Código Identificador</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: Q4-03 (Automático)"
                className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all font-mono placeholder:text-[#A3A3A3]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Título / Conceito do Vídeo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pare de Queimar Dinheiro em Anúncios Genéricos"
              className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all font-semibold placeholder:text-[#A3A3A3]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] flex items-center justify-between mb-1">
              <span>Gancho Inicial (Hook - Primeiros 3s)</span>
              <span className="text-[11px] text-[#3478F6] font-medium">Elemento chave</span>
            </label>
            <textarea
              rows={2}
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Ex: Se você ainda cria vídeos sem teleprompter estruturado, está perdendo 80% da sua audiência..."
              className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all placeholder:text-[#A3A3A3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Status da Produção</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CreativeStatus)}
                className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all font-medium"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Tags (Separadas por vírgula)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ex: Meta Ads, UGC, POV, TikTok"
                className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all placeholder:text-[#A3A3A3]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Roteiro Completo Inicial (Opcional)</label>
            <textarea
              rows={3}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Cole seu rascunho de roteiro aqui. O assistente pode dividir em cenas automaticamente."
              className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all placeholder:text-[#A3A3A3]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-[#EFEFEF]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-full text-xs font-semibold text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors text-center cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#3478F6] hover:bg-[#2c65cf] text-white shadow-xs transition-colors text-center cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              {existingCreative ? 'Salvar Alterações' : 'Criar Criativo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
