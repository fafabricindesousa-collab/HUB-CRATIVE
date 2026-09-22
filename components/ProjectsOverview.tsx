'use client';

import React, { useState } from 'react';
import { Project, Creative } from '@/types/creative';
import { 
  Film, 
  FolderKanban, 
  Plus, 
  Search, 
  ArrowRight, 
  Edit3, 
  Trash2, 
  Mic, 
  FileText,
  CheckCircle2, 
  Play,
  Layers,
  Sparkles
} from 'lucide-react';

interface ProjectsOverviewProps {
  projects: Project[];
  allCreatives: Creative[];
  onSelectProject: (project: Project) => void;
  onSelectCreative?: (creative: Creative, project: Project) => void;
  onNewProject: () => void;
  onNewCreative?: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({
  projects,
  allCreatives,
  onSelectProject,
  onSelectCreative,
  onNewProject,
  onNewCreative,
  onEditProject,
  onDeleteProject,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewTab, setViewTab] = useState<'videos' | 'campaigns'>('videos');

  const filteredCreatives = allCreatives.filter((c) => {
    const s = searchTerm.toLowerCase();
    const project = projects.find((p) => p.id === c.projectId);
    return (
      c.title.toLowerCase().includes(s) ||
      c.code.toLowerCase().includes(s) ||
      (c.hook && c.hook.toLowerCase().includes(s)) ||
      (project && project.name.toLowerCase().includes(s))
    );
  });

  const filteredProjects = projects.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.code.toLowerCase().includes(s) ||
      (p.description && p.description.toLowerCase().includes(s))
    );
  });

  const handleCreativeClick = (creative: Creative) => {
    const proj = projects.find((p) => p.id === creative.projectId) || projects[0];
    if (onSelectCreative && proj) {
      onSelectCreative(creative, proj);
    } else if (proj) {
      onSelectProject(proj);
    }
  };

  return (
    <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Visual Top Header */}
      <div className="bg-white rounded-[20px] p-5 sm:p-7 border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eff5ff] text-[#2c65cf] border border-[#d6e5fd]">
              <Film className="w-3.5 h-3.5" />
              Estúdio de Gravação & Roteiros
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1A1A1A] tracking-[-0.03em]">
            Seus Vídeos & Criativos
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] max-w-xl">
            Tudo o que você precisa para gravar: <strong>Roteiro</strong>, <strong>Áudio</strong> e <strong>Material dos Vídeos</strong> organizados em um só lugar.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0 w-full md:w-auto">
          {onNewCreative && (
            <button
              id="btn-overview-new-creative"
              onClick={onNewCreative}
              className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold bg-[#3478F6] hover:bg-[#2c65cf] text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Vídeo</span>
            </button>
          )}

          <button
            id="btn-overview-new-project"
            onClick={onNewProject}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold bg-[#F5F5F5] hover:bg-[#EFEFEF] text-[#1A1A1A] border border-[#E5E5E5] transition-all cursor-pointer"
          >
            <FolderKanban className="w-4 h-4 text-[#737373]" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* Control Bar: View Toggle & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Toggle between Videos (Visual) and Campaigns */}
        <div className="flex items-center p-1 bg-[#F5F5F5] rounded-full border border-[#EFEFEF] w-full sm:w-fit justify-between sm:justify-start">
          <button
            onClick={() => setViewTab('videos')}
            className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 sm:py-1.5 min-h-[38px] rounded-full text-xs font-semibold transition-all ${
              viewTab === 'videos'
                ? 'bg-white text-[#1A1A1A] shadow-[0_1px_2px_rgba(10,10,10,0.06)]'
                : 'text-[#737373] hover:text-[#1A1A1A]'
            }`}
          >
            <Film className={`w-3.5 h-3.5 ${viewTab === 'videos' ? 'text-[#3478F6]' : 'text-[#737373]'}`} />
            <span>Vídeos ({allCreatives.length})</span>
          </button>

          <button
            onClick={() => setViewTab('campaigns')}
            className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 sm:py-1.5 min-h-[38px] rounded-full text-xs font-semibold transition-all ${
              viewTab === 'campaigns'
                ? 'bg-white text-[#1A1A1A] shadow-[0_1px_2px_rgba(10,10,10,0.06)]'
                : 'text-[#737373] hover:text-[#1A1A1A]'
            }`}
          >
            <FolderKanban className={`w-3.5 h-3.5 ${viewTab === 'campaigns' ? 'text-[#3478F6]' : 'text-[#737373]'}`} />
            <span>Campanhas ({projects.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={viewTab === 'videos' ? 'Buscar vídeo ou gancho...' : 'Buscar campanha...'}
            className="w-full text-sm sm:text-xs pl-10 pr-4 py-2.5 sm:py-2 rounded-full bg-white border border-[#E5E5E5] text-[#1A1A1A] placeholder-[#737373] focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. VÍDEOS / CRIATIVOS (VISUAL GRID) */}
      {/* ======================================================== */}
      {viewTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCreatives.map((creative) => {
            const project = projects.find((p) => p.id === creative.projectId);

            return (
              <div
                key={creative.id}
                onClick={() => handleCreativeClick(creative)}
                className="group bg-white rounded-[18px] border border-[#E5E5E5] hover:border-[#3478F6] shadow-[0_1px_3px_rgba(10,10,10,0.04)] hover:shadow-[0_8px_24px_rgba(52,120,246,0.1)] transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Header Slate */}
                <div className="p-4 sm:p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md text-white shadow-xs"
                        style={{ backgroundColor: project?.color || '#3478F6' }}
                      >
                        {creative.code}
                      </span>
                      <span className="text-[11px] font-semibold text-[#737373]">
                        {project?.name || 'Campanha'}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAFAFA] text-[#525252] border border-[#E5E5E5]">
                      9:16 Vertical
                    </span>
                  </div>

                  {/* Creative Title */}
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#3478F6] transition-colors line-clamp-2 leading-snug">
                    {creative.title}
                  </h3>

                  {/* Hook Quote Box (Visual Focus) */}
                  {creative.hook && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] group-hover:border-[#d6e5fd] transition-colors">
                      <div className="text-[10px] font-bold text-[#737373] uppercase tracking-wide mb-1">
                        Gancho do Vídeo
                      </div>
                      <p className="text-xs text-[#1A1A1A] line-clamp-2 italic leading-relaxed">
                        &ldquo;{creative.hook}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* The 3 Core Pillars Status Bar (Roteiro, Áudio, Material) */}
                <div className="px-4 sm:px-5 py-3 bg-[#FAFAFA] border-t border-[#EFEFEF] space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {/* Pillar 1: Roteiro */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-[#E5E5E5]">
                      <FileText className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-[#1A1A1A]">{creative.scenesCount}</span> cenas
                      </div>
                    </div>

                    {/* Pillar 2: Áudio */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-[#E5E5E5]">
                      <Mic className={`w-3.5 h-3.5 shrink-0 ${creative.hasAudio ? 'text-[#12A642]' : 'text-[#a66608]'}`} />
                      <div className="truncate font-semibold text-[#1A1A1A]">
                        {creative.hasAudio ? 'Gravado' : 'Gravar'}
                      </div>
                    </div>

                    {/* Pillar 3: Material */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-[#E5E5E5]">
                      <Film className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-[#1A1A1A]">{creative.approvedAssetsCount || 0}</span> itens
                      </div>
                    </div>
                  </div>

                  {/* Direct Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-[#3478F6] group-hover:underline flex items-center gap-1">
                      <span>Abrir Roteiro & Gravação</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="text-[10px] text-[#A3A3A3]">
                      Toque para entrar
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create Creative Dashed Card */}
          {onNewCreative && (
            <button
              onClick={onNewCreative}
              className="rounded-[18px] p-6 border-2 border-dashed border-[#D4D4D4] hover:border-[#3478F6] hover:bg-[#eff5ff]/30 transition-all flex flex-col items-center justify-center text-center group min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-[#F5F5F5] group-hover:bg-[#eff5ff] text-[#737373] group-hover:text-[#3478F6] flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#3478F6] transition-colors">
                Criar Novo Vídeo
              </h4>
              <p className="text-xs text-[#737373] max-w-xs mt-1">
                Adicione um novo criativo com gancho, roteiro e materiais.
              </p>
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CAMPANHAS (VISUAL CAMPAIGN CARDS) */}
      {/* ======================================================== */}
      {viewTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProjects.map((project) => {
            const projectCreatives = allCreatives.filter((c) => c.projectId === project.id);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group bg-white rounded-[18px] p-5 sm:p-6 border border-[#E5E5E5] hover:border-[#3478F6] shadow-[0_1px_3px_rgba(10,10,10,0.04)] hover:shadow-[0_8px_24px_rgba(10,10,10,0.08)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded-md text-white shadow-xs"
                        style={{ backgroundColor: project.color || '#3478F6' }}
                      >
                        {project.code}
                      </span>
                      <span className="text-xs font-semibold text-[#737373]">
                        {projectCreatives.length} {projectCreatives.length === 1 ? 'vídeo' : 'vídeos'}
                      </span>
                    </div>

                    <div 
                      className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEditProject(project)}
                        className="p-1.5 rounded-full text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                        title="Editar detalhes"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir o projeto "${project.name}"?`)) {
                            onDeleteProject(project.id);
                          }
                        }}
                        className="p-1.5 rounded-full text-[#737373] hover:text-[#F33D3D] hover:bg-[#fef3f3] transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-[#1A1A1A] group-hover:text-[#3478F6] transition-colors">
                    {project.name}
                  </h3>
                  
                  <p className="text-xs text-[#737373] mt-1.5 line-clamp-2 leading-relaxed">
                    {project.description || 'Campanha de produção de criativos de marketing.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#EFEFEF] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3478F6] group-hover:underline flex items-center gap-1">
                    <span>Ver Vídeos da Campanha</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            );
          })}

          <button
            onClick={onNewProject}
            className="rounded-[18px] p-6 border-2 border-dashed border-[#D4D4D4] hover:border-[#3478F6] hover:bg-[#eff5ff]/30 transition-all flex flex-col items-center justify-center text-center group min-h-[180px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] group-hover:bg-[#eff5ff] text-[#737373] group-hover:text-[#3478F6] flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[#1A1A1A] group-hover:text-[#3478F6] transition-colors">
              Criar Nova Campanha
            </h4>
          </button>
        </div>
      )}

    </div>
  );
};
