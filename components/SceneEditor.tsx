'use client';

import React, { useState } from 'react';
import { Scene, Creative } from '@/types/creative';
import { saveScene, deleteScene } from '@/lib/storage';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Video, 
  Mic, 
  FileText, 
  Clock, 
  Edit3, 
  Check, 
  Copy,
  Tv,
  Sparkles
} from 'lucide-react';

interface SceneEditorProps {
  creative: Creative;
  scenes: Scene[];
  onScenesUpdated: () => void;
  onOpenAiAssist: () => void;
  onOpenPrompter?: () => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  creative,
  scenes,
  onScenesUpdated,
  onOpenAiAssist,
  onOpenPrompter,
}) => {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editSpeech, setEditSpeech] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editVisual, setEditVisual] = useState<string>('');
  const [editBroll, setEditBroll] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const handleStartEdit = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setEditTitle(scene.title);
    setEditSpeech(scene.speech);
    setEditVisual(scene.visualInstruction || '');
    setEditBroll(scene.brollInstruction || '');
    setEditNotes(scene.notes || '');
  };

  const handleSaveEdit = async (sceneId: string) => {
    const target = scenes.find((s) => s.id === sceneId);
    if (!target) return;

    const updated: Scene = {
      ...target,
      title: editTitle.trim() || target.title,
      speech: editSpeech.trim(),
      visualInstruction: editVisual.trim(),
      brollInstruction: editBroll.trim(),
      notes: editNotes.trim(),
      updatedAt: new Date().toISOString(),
    };

    await saveScene(updated);
    setEditingSceneId(null);
    onScenesUpdated();
  };

  const handleAddScene = async () => {
    const nextOrder = scenes.length > 0 ? Math.max(...scenes.map((s) => s.order)) + 1 : 1;
    const newScene: Scene = {
      id: `sc_${Date.now()}`,
      creativeId: creative.id,
      projectId: creative.projectId,
      order: nextOrder,
      title: `Cena ${nextOrder} - Nova Cena`,
      speech: 'Digite aqui a fala do apresentador ou locutor...',
      visualInstruction: 'Enquadramento e ação recomendada na câmera',
      brollInstruction: 'Take secundário ou inserção de tela',
      notes: 'Entonação e dicas de gravação',
      ownerId: creative.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveScene(newScene);
    onScenesUpdated();
    handleStartEdit(newScene);
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (scenes.length <= 1) {
      if (!confirm('Esta é a única cena. Deseja realmente excluir?')) return;
    }
    await deleteScene(creative.projectId, creative.id, sceneId);
    onScenesUpdated();
  };

  const handleMoveScene = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= scenes.length) return;

    const currentScene = scenes[index];
    const targetScene = scenes[targetIndex];

    const updatedCurrent = { ...currentScene, order: targetScene.order };
    const updatedTarget = { ...targetScene, order: currentScene.order };

    await saveScene(updatedCurrent);
    await saveScene(updatedTarget);
    onScenesUpdated();
  };

  // Estimate speech duration: ~130 words per minute
  const estimateDuration = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const seconds = Math.max(1, Math.round((words / 130) * 60));
    return seconds;
  };

  const totalWords = scenes.reduce((acc, s) => acc + s.speech.trim().split(/\s+/).filter(Boolean).length, 0);
  const totalEstimatedSecs = Math.round((totalWords / 130) * 60);

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-[16px] border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#F5F5F5] text-[#1A1A1A] border border-[#E5E5E5]">
              {creative.code}
            </span>
            <h3 className="font-bold text-[#1A1A1A] text-sm tracking-tight">{creative.title}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#737373] mt-1.5">
            <span>{scenes.length} Cenas</span>
            <span>&bull;</span>
            <span>{totalWords} palavras</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-semibold text-[#1A1A1A]">
              <Clock className="w-3.5 h-3.5 text-[#3478F6]" /> ~{totalEstimatedSecs}s de vídeo
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onOpenPrompter && (
            <button
              id="btn-open-prompter-from-editor"
              onClick={onOpenPrompter}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 min-h-[38px] rounded-full text-xs font-semibold bg-[#1A1A1A] hover:bg-[#333333] text-white shadow-xs transition-colors flex-1 sm:flex-none"
            >
              <Tv className="w-3.5 h-3.5 text-[#3478F6]" />
              <span>Teleprompter</span>
            </button>
          )}

          <button
            id="btn-ai-generate-scenes"
            onClick={onOpenAiAssist}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 min-h-[38px] rounded-full text-xs font-semibold bg-[#f3f7fe] hover:bg-[#e3ecfe] text-[#2c65cf] transition-colors flex-1 sm:flex-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3478F6]" />
            <span>Roteiro com IA</span>
          </button>

          <button
            id="btn-add-scene"
            onClick={handleAddScene}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 min-h-[38px] rounded-full text-xs font-semibold bg-[#3478F6] hover:bg-[#2c65cf] text-white shadow-xs transition-all w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Cena</span>
          </button>
        </div>
      </div>

      {/* Scene Cards List */}
      <div className="space-y-4">
        {scenes.map((scene, idx) => {
          const isEditing = editingSceneId === scene.id;
          const duration = estimateDuration(scene.speech);

          return (
            <div
              key={scene.id}
              className={`bg-white rounded-[16px] border transition-all shadow-[0_1px_3px_rgba(10,10,10,0.04)] overflow-hidden ${
                isEditing ? 'border-[#3478F6] ring-2 ring-[#3478F6]/20' : 'border-[#E5E5E5] hover:border-[#D4D4D4]'
              }`}
            >
              {/* Scene Card Header */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 bg-[#FAFAFA] border-b border-[#EFEFEF] gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="font-bold text-sm text-[#1A1A1A] bg-white border border-[#D4D4D4] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20"
                      placeholder="Título da Cena"
                    />
                  ) : (
                    <h4 className="font-bold text-[#1A1A1A] text-sm">{scene.title}</h4>
                  )}
                  <span className="text-xs font-medium text-[#525252] bg-[#F5F5F5] border border-[#E5E5E5] px-2.5 py-0.5 rounded-full">
                    ~{duration}s
                  </span>
                </div>

                {/* Move & Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveScene(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-full text-[#737373] hover:text-[#1A1A1A] hover:bg-[#EFEFEF] disabled:opacity-30 transition-colors"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveScene(idx, 'down')}
                    disabled={idx === scenes.length - 1}
                    className="p-1.5 rounded-full text-[#737373] hover:text-[#1A1A1A] hover:bg-[#EFEFEF] disabled:opacity-30 transition-colors"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(scene)}
                      className="p-1.5 rounded-full text-[#737373] hover:text-[#1A1A1A] hover:bg-[#EFEFEF] transition-colors ml-1"
                      title="Editar Cena"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveEdit(scene.id)}
                      className="px-3 py-1 rounded-full bg-[#12A642] hover:bg-[#0f8b37] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Salvar
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteScene(scene.id)}
                    className="p-1.5 rounded-full text-[#737373] hover:text-[#F33D3D] hover:bg-[#fef3f3] transition-colors"
                    title="Excluir Cena"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scene Content Body */}
              <div className="p-4 sm:p-5 space-y-4">
                {/* Spoken Script (Speech) */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#737373] block mb-1.5">
                    Fala do Apresentador (O que é falado)
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editSpeech}
                      onChange={(e) => setEditSpeech(e.target.value)}
                      className="w-full text-sm p-3.5 rounded-xl border border-[#D4D4D4] focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 font-sans"
                      placeholder="Texto falado no teleprompter..."
                    />
                  ) : (
                    <p className="text-sm text-[#1A1A1A] leading-relaxed font-normal bg-[#FAFAFA] p-3.5 rounded-xl border border-[#EFEFEF] whitespace-pre-line">
                      {scene.speech}
                    </p>
                  )}
                </div>

                {/* Directorial & Visual Cues (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Visual Instruction */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#737373] flex items-center gap-1.5 mb-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#3478F6]" />
                      Direção de Câmera / Visual
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editVisual}
                        onChange={(e) => setEditVisual(e.target.value)}
                        className="w-full text-sm sm:text-xs p-2.5 rounded-xl border border-[#D4D4D4] focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20"
                        placeholder="Ex: Olhar fixo para lente, plano médio fechado..."
                      />
                    ) : (
                      <div className="text-xs text-[#525252] p-2.5 bg-[#FAFAFA] rounded-xl border border-[#EFEFEF]">
                        {scene.visualInstruction || 'Sem instruções visuais cadastradas.'}
                      </div>
                    )}
                  </div>

                  {/* B-Roll Instruction */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#737373] flex items-center gap-1.5 mb-1.5">
                      <Video className="w-3.5 h-3.5 text-[#12A642]" />
                      B-Roll / Takes de Apoio
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editBroll}
                        onChange={(e) => setEditBroll(e.target.value)}
                        className="w-full text-sm sm:text-xs p-2.5 rounded-xl border border-[#D4D4D4] focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20"
                        placeholder="Ex: Print do gráfico, tela do produto..."
                      />
                    ) : (
                      <div className="text-xs text-[#525252] p-2.5 bg-[#FAFAFA] rounded-xl border border-[#EFEFEF]">
                        {scene.brollInstruction || 'Sem B-Roll especificado.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Notes */}
                {(isEditing || scene.notes) && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#737373] block mb-1.5">
                      Observações de Produção
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full text-sm sm:text-xs p-2.5 rounded-xl border border-[#D4D4D4] focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20"
                        placeholder="Ex: Tom enérgico, sem gesticular excessivamente..."
                      />
                    ) : (
                      <div className="text-xs text-[#737373] italic p-2 bg-[#FAFAFA] rounded-xl border border-[#EFEFEF]">
                        {scene.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Bottom Quick-Add Scene Button for Mobile */}
        <button
          onClick={handleAddScene}
          className="w-full py-3.5 px-4 rounded-[16px] border-2 border-dashed border-[#D4D4D4] hover:border-[#3478F6] text-[#525252] hover:text-[#3478F6] bg-[#FAFAFA] hover:bg-[#f3f7fe] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px]"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Nova Cena ao Roteiro</span>
        </button>
      </div>
    </div>
  );
};
