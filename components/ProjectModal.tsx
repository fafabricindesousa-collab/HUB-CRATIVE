'use client';

import React, { useState } from 'react';
import { Project } from '@/types/creative';
import { saveProject } from '@/lib/storage';
import { auth } from '@/lib/firebase';
import { X, FolderPlus } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSaved: (project: Project) => void;
  existingProject?: Project | null;
}

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#06b6d4', // cyan
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectSaved,
  existingProject,
}) => {
  const [name, setName] = useState<string>(existingProject?.name || '');
  const [code, setCode] = useState<string>(existingProject?.code || '');
  const [description, setDescription] = useState<string>(existingProject?.description || '');
  const [color, setColor] = useState<string>(existingProject?.color || COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const user = auth.currentUser;
    const project: Project = {
      id: existingProject?.id || `proj_${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      color,
      creativeCounter: existingProject?.creativeCounter || 0,
      status: 'active',
      ownerId: user?.uid || 'demo_user',
      createdAt: existingProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProject(project);
    onProjectSaved(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-t-[24px] sm:rounded-[20px] max-w-md w-full p-5 sm:p-6 shadow-[0_8px_30px_rgba(10,10,10,0.16)] border border-[#E5E5E5] relative pb-safe">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#eff5ff] text-[#3478F6] border border-[#d6e5fd] flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A1A] text-base tracking-tight">
              {existingProject ? 'Editar Campanha' : 'Nova Campanha de Criativos'}
            </h3>
            <p className="text-xs text-[#737373]">Agrupe criativos por produto ou campanha</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Nome da Campanha / Produto *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lançamento Q4 - Black Friday"
              className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all placeholder:text-[#A3A3A3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Código Prefixo *</label>
              <input
                type="text"
                required
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: BF, Q4, APP"
                className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all uppercase font-mono font-bold placeholder:text-[#A3A3A3]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Cor da Tag</label>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-[#3478F6] ring-offset-2' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">Descrição do Objetivo</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Criativos focados em público frio e remarketing..."
              className="w-full text-sm sm:text-xs p-3 sm:p-2.5 rounded-xl border border-[#D4D4D4] bg-[#FAFAFA] text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all placeholder:text-[#A3A3A3]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-[#EFEFEF]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-full text-xs font-semibold text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors text-center min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#3478F6] hover:bg-[#2c65cf] text-white shadow-xs transition-colors text-center min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              {existingProject ? 'Salvar Alterações' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
