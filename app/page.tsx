'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Project, Creative, Scene, Asset, CreativeStatus } from '@/types/creative';
import { 
  getProjects, 
  getCreatives, 
  getScenes, 
  getAssets, 
  saveCreative,
  deleteCreative,
  deleteProject,
  saveProject,
  initializeLocalData 
} from '@/lib/storage';
import { testConnection } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { ProjectsOverview } from '@/components/ProjectsOverview';
import { SceneEditor } from '@/components/SceneEditor';
import { Teleprompter } from '@/components/Teleprompter';
import { AudioStudio } from '@/components/AudioStudio';
import { VideoMaterials } from '@/components/VideoMaterials';
import { MobileSyncModal } from '@/components/MobileSyncModal';
import { AiScriptAssistant } from '@/components/AiScriptAssistant';
import { ProjectModal } from '@/components/ProjectModal';
import { CreativeModal } from '@/components/CreativeModal';
import { ExportZipModal } from '@/components/ExportZipModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Clapperboard, 
  Film, 
  Search, 
  Sparkles, 
  Smartphone, 
  QrCode, 
  Download, 
  Mic, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Tv,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Layers
} from 'lucide-react';

const STATUS_LABELS: Record<CreativeStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  idea: { label: 'Ideia', bg: 'bg-[#F5F5F5]', text: 'text-[#525252]', border: 'border-[#E5E5E5]', dot: 'bg-[#737373]' },
  scripted: { label: 'Roteirizado', bg: 'bg-[#f3f7fe]', text: 'text-[#2c65cf]', border: 'border-[#c2d7fc]', dot: 'bg-[#3478F6]' },
  recording: { label: 'Gravando', bg: 'bg-[#fcf7f0]', text: 'text-[#a66608]', border: 'border-[#eed7b6]', dot: 'bg-[#C6790A]' },
  done: { label: 'Pronto', bg: 'bg-[#f3fcfa]', text: 'text-[#2b8778]', border: 'border-[#c5eee7]', dot: 'bg-[#3FC6B0]' },
  approved: { label: 'Aprovado', bg: 'bg-[#f1faf4]', text: 'text-[#0f8b37]', border: 'border-[#b8e4c6]', dot: 'bg-[#12A642]' },
};

function CreativeHubMain() {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [allCreatives, setAllCreatives] = useState<Creative[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // View Navigation: 'projects' overview (default) or 'workspace'
  const [currentView, setCurrentView] = useState<'projects' | 'workspace'>('projects');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Responsive & View States
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('detail');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Main Workspace Tab: Roteiro, Áudio, Material dos Vídeos
  const [activeTab, setActiveTab] = useState<'scenes' | 'prompter' | 'audio' | 'materials'>('scenes');

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [isCreativeModalOpen, setIsCreativeModalOpen] = useState<boolean>(false);
  const [isAiAssistOpen, setIsAiAssistOpen] = useState<boolean>(false);
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState<boolean>(false);
  const [isExportZipOpen, setIsExportZipOpen] = useState<boolean>(false);

  // Production Notes state
  const [productionNotes, setProductionNotes] = useState<string>(
    '• Cenário: Fundo limpo, iluminação de três pontos com luz suave de preenchimento.\n• Tom de voz: Natural, seguro, falando diretamente com o interlocutor.\n• Formato: 9:16 vertical para celular (Reels, TikTok, Shorts).'
  );
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    initializeLocalData();
    testConnection();

    Promise.all([getProjects(), getCreatives()]).then(([projList, allCrList]) => {
      setProjects(projList);
      setAllCreatives(allCrList);

      const paramCreativeId = searchParams.get('creativeId');
      const paramProjectId = searchParams.get('projectId');
      const paramView = searchParams.get('view');

      if (paramProjectId || paramCreativeId || paramView === 'prompter') {
        let proj = projList[0] || null;
        if (paramProjectId) {
          const matched = projList.find(p => p.id === paramProjectId);
          if (matched) proj = matched;
        } else if (paramCreativeId) {
          const matchedCr = allCrList.find(c => c.id === paramCreativeId);
          if (matchedCr) {
            const matchedProj = projList.find(p => p.id === matchedCr.projectId);
            if (matchedProj) proj = matchedProj;
          }
        }
        setSelectedProject(proj);
        setCurrentView('workspace');
      } else {
        // Default to clean projects overview first!
        if (projList.length > 0) {
          setSelectedProject(projList[0]);
        }
        setCurrentView('projects');
      }
    });
  }, [searchParams]);

  // Load creatives when selected project changes
  useEffect(() => {
    if (selectedProject) {
      getCreatives(selectedProject.id).then((crList) => {
        setCreatives(crList);
        // Check URL params for target creative or fallback to first
        const paramCreativeId = searchParams.get('creativeId');
        const paramView = searchParams.get('view');
        
        let target = crList[0] || null;
        if (paramCreativeId) {
          const matched = crList.find(c => c.id === paramCreativeId);
          if (matched) target = matched;
        }
        setSelectedCreative(target);

        if (paramView === 'prompter') {
          setActiveTab('prompter');
          setMobileView('detail');
        }
      });
    }
  }, [selectedProject, searchParams]);

  // Load scenes and assets when selected creative changes
  useEffect(() => {
    let isCurrent = true;
    if (selectedCreative) {
      Promise.all([
        getScenes(selectedCreative.id),
        getAssets(selectedCreative.id)
      ]).then(([scList, astList]) => {
        if (isCurrent) {
          setScenes(scList);
          setAssets(astList);
        }
      });
    } else {
      Promise.resolve().then(() => {
        if (isCurrent) {
          setScenes([]);
          setAssets([]);
        }
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [selectedCreative]);

  const refreshScenes = async () => {
    if (selectedCreative) {
      const scList = await getScenes(selectedCreative.id);
      setScenes(scList);
      const updated = { ...selectedCreative, scenesCount: scList.length };
      await saveCreative(updated);
      setSelectedCreative(updated);
    }
  };

  const refreshAssets = async () => {
    if (selectedCreative) {
      const astList = await getAssets(selectedCreative.id);
      setAssets(astList);
      const audioCount = astList.filter(a => a.type === 'audio').length;
      const approvedCount = astList.filter(a => a.isApproved).length;
      const updated = { 
        ...selectedCreative, 
        hasAudio: audioCount > 0, 
        approvedAssetsCount: approvedCount 
      };
      await saveCreative(updated);
      setSelectedCreative(updated);
    }
  };

  const refreshCreatives = async () => {
    const all = await getCreatives();
    setAllCreatives(all);
    if (selectedProject) {
      const list = all.filter(c => c.projectId === selectedProject.id);
      setCreatives(list);
    }
  };

  const handleSelectProjectFromOverview = (proj: Project) => {
    setSelectedProject(proj);
    setCurrentView('workspace');
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setAllCreatives(prev => prev.filter(c => c.projectId !== projectId));
    if (selectedProject?.id === projectId) {
      const remaining = projects.filter(p => p.id !== projectId);
      setSelectedProject(remaining[0] || null);
    }
  };

  const handleDeleteCreative = async (creativeId: string) => {
    if (!selectedProject || !confirm('Deseja realmente excluir este criativo?')) return;
    await deleteCreative(selectedProject.id, creativeId);
    const updatedList = creatives.filter(c => c.id !== creativeId);
    setCreatives(updatedList);
    setAllCreatives(prev => prev.filter(c => c.id !== creativeId));
    if (selectedCreative?.id === creativeId) {
      setSelectedCreative(updatedList[0] || null);
    }
  };

  const handleStatusChange = async (newStatus: CreativeStatus) => {
    if (!selectedCreative) return;
    const updated = { ...selectedCreative, status: newStatus, updatedAt: new Date().toISOString() };
    await saveCreative(updated);
    setSelectedCreative(updated);
    refreshCreatives();
  };

  // Filter creatives
  const filteredCreatives = creatives.filter((c) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate dynamic stats
  const totalWords = scenes.reduce((acc, s) => acc + s.speech.trim().split(/\s+/).filter(Boolean).length, 0);
  const totalEstimatedSeconds = Math.max(5, Math.round((totalWords / 130) * 60));
  const audioTakesCount = assets.filter(a => a.type === 'audio').length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] flex flex-col font-sans pb-24 lg:pb-0">
      
      {/* Top Header */}
      <Header
        projects={projects}
        selectedProject={selectedProject}
        currentView={currentView}
        onNavigateToProjects={() => setCurrentView('projects')}
        onNavigateToWorkspace={() => {
          if (selectedProject) setCurrentView('workspace');
        }}
        onSelectProject={(p) => {
          setSelectedProject(p);
          setCurrentView('workspace');
        }}
        onNewProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onNewCreative={() => setIsCreativeModalOpen(true)}
        onOpenMobileSync={() => setIsMobileSyncOpen(true)}
        onOpenAiAssist={() => setIsAiAssistOpen(true)}
      />

      {/* Main Content: Overview vs Workspace */}
      {currentView === 'projects' ? (
        <main className="flex-1 w-full">
          <ProjectsOverview
            projects={projects}
            allCreatives={allCreatives}
            onSelectProject={handleSelectProjectFromOverview}
            onSelectCreative={(cr, proj) => {
              setSelectedProject(proj);
              setSelectedCreative(cr);
              setCurrentView('workspace');
              setMobileView('detail');
            }}
            onNewProject={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            onNewCreative={() => {
              setIsCreativeModalOpen(true);
            }}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        </main>
      ) : (
        <div className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4">
          
          {/* Workspace Project Navigation Header */}
          <div className="w-full bg-white rounded-[16px] px-4 py-3 border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.04)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <button
                id="btn-back-to-projects"
                onClick={() => setCurrentView('projects')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EFEFEF] text-[#1A1A1A] font-semibold transition-colors shadow-xs"
                title="Voltar para lista de campanhas"
              >
                <ChevronLeft className="w-4 h-4 text-[#737373]" />
                <span>Todos os Projetos</span>
              </button>
              <span className="text-[#A3A3A3] hidden sm:inline">/</span>
              <div className="hidden sm:flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: selectedProject?.color || '#3478F6' }}
                />
                <span className="font-bold text-[#1A1A1A] text-sm">{selectedProject?.name}</span>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]">
                  {selectedProject?.code}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedProject) {
                    setEditingProject(selectedProject);
                    setIsProjectModalOpen(true);
                  }
                }}
                className="text-xs font-semibold text-[#737373] hover:text-[#1A1A1A] px-3 py-1.5 rounded-full hover:bg-[#F5F5F5] transition-colors hidden sm:inline-block"
              >
                Editar Campanha
              </button>
              <button
                onClick={() => setCurrentView('projects')}
                className="text-xs font-semibold text-[#3478F6] hover:underline px-2.5 py-1.5"
              >
                Trocar de Campanha
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
        
        {/* ======================================================== */}
        {/* SIDEBAR: Creatives list (Desktop collapsible, Mobile view) */}
        {/* ======================================================== */}
        {(!isMobile || mobileView === 'list') && (
          <aside className={`w-full ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-80'} shrink-0 transition-all duration-200 space-y-3`}>
            
            {/* Desktop Collapse / Expand Header Button */}
            <div className="hidden lg:flex items-center justify-between px-1">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#737373]">
                    Criativos ({filteredCreatives.length})
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-full hover:bg-[#EFEFEF] text-[#737373] hover:text-[#1A1A1A] transition-colors ml-auto"
                title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>

            {/* When collapsed on desktop: show minimal vertical icon strip */}
            {isSidebarCollapsed && (
              <div className="hidden lg:flex flex-col items-center gap-2 p-2 bg-white rounded-[16px] border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.06)]">
                <button
                  onClick={() => setIsCreativeModalOpen(true)}
                  className="w-10 h-10 rounded-full bg-[#3478F6] text-white flex items-center justify-center hover:bg-[#2c65cf] transition-colors shadow-xs"
                  title="Novo Criativo"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <div className="w-full border-t border-[#EFEFEF] my-1" />
                {filteredCreatives.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCreative(c)}
                    className={`w-10 h-10 rounded-xl font-mono text-[10px] font-bold flex items-center justify-center transition-all ${
                      selectedCreative?.id === c.id 
                        ? 'bg-[#3478F6] text-white shadow-xs' 
                        : 'bg-[#F5F5F5] text-[#525252] hover:bg-[#E5E5E5]'
                    }`}
                    title={`${c.code}: ${c.title}`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            )}

            {/* Standard full sidebar (Desktop expanded or Mobile list) */}
            {(!isSidebarCollapsed || isMobile) && (
              <div className="space-y-3">
                
                {/* Search & Filter Card */}
                <div className="bg-white rounded-[16px] p-3.5 border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.06)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#3478F6]" />
                      Todos os Criativos ({filteredCreatives.length})
                    </span>
                    <button
                      onClick={() => setIsCreativeModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#3478F6] hover:bg-[#2c65cf] text-white transition-colors shadow-xs"
                      title="Novo Criativo"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Novo</span>
                    </button>
                  </div>

                  {/* Search Input (Pill Shape per Design System SearchField) */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por título, código ou tag..."
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-full bg-white border border-[#E5E5E5] text-[#1A1A1A] placeholder-[#737373] focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20 transition-all"
                    />
                  </div>

                  {/* Filter Chips (Pill Shaped) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                        statusFilter === 'all' 
                          ? 'bg-[#f3f7fe] text-[#2c65cf] border-[#c2d7fc] shadow-xs' 
                          : 'bg-[#F5F5F5] text-[#525252] border-transparent hover:bg-[#EFEFEF]'
                      }`}
                    >
                      Todos
                    </button>
                    {(['idea', 'scripted', 'recording', 'done', 'approved'] as CreativeStatus[]).map((st) => {
                      const meta = STATUS_LABELS[st];
                      const isSel = statusFilter === st;
                      return (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                            isSel 
                              ? 'bg-[#f3f7fe] text-[#2c65cf] border-[#c2d7fc] shadow-xs' 
                              : 'bg-[#F5F5F5] text-[#525252] border-transparent hover:bg-[#EFEFEF]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          <span>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Creatives Cards List */}
                <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                  {filteredCreatives.length === 0 ? (
                    <div className="bg-white rounded-[16px] p-6 border border-[#E5E5E5] text-center text-xs text-[#737373] space-y-2">
                      <Film className="w-8 h-8 text-[#A3A3A3] mx-auto" />
                      <p>Nenhum criativo encontrado.</p>
                      <button
                        onClick={() => setIsCreativeModalOpen(true)}
                        className="text-xs font-semibold text-[#3478F6] hover:underline"
                      >
                        + Criar agora
                      </button>
                    </div>
                  ) : (
                    filteredCreatives.map((cr) => {
                      const isSelected = selectedCreative?.id === cr.id;
                      const statusMeta = STATUS_LABELS[cr.status];

                      return (
                        <div
                          key={cr.id}
                          onClick={() => {
                            setSelectedCreative(cr);
                            if (isMobile) setMobileView('detail');
                          }}
                          className={`p-3.5 rounded-[16px] border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-white border-[#3478F6] shadow-[0_4px_16px_rgba(10,10,10,0.08)] ring-1 ring-[#3478F6]'
                              : 'bg-white hover:bg-[#FAFAFA] border-[#E5E5E5] shadow-[0_1px_2px_rgba(10,10,10,0.05)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F5F5F5] text-[#1A1A1A] border border-[#E5E5E5]">
                              {cr.code}
                            </span>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                              {statusMeta.label}
                            </span>
                          </div>

                          <h4 className="font-semibold text-xs text-[#1A1A1A] line-clamp-2 leading-snug">
                            {cr.title}
                          </h4>

                          {cr.hook && (
                            <p className="text-[11px] text-[#737373] italic line-clamp-1 mt-1">
                              &ldquo;{cr.hook}&rdquo;
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#EFEFEF] text-[11px] text-[#737373]">
                            <div className="flex items-center gap-2">
                              <span>{cr.scenesCount || 0} cenas</span>
                              {cr.hasAudio && (
                                <span className="flex items-center gap-0.5 text-[#12A642] font-semibold">
                                  <Mic className="w-3 h-3" /> Áudio
                                </span>
                              )}
                            </div>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-[#3478F6]' : 'text-[#A3A3A3]'}`} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}
          </aside>
        )}

        {/* ======================================================== */}
        {/* WORKSPACE AREA: Current Creative Details, Script & Prompter */}
        {/* ======================================================== */}
        {(!isMobile || mobileView === 'detail') && (
          <main className="flex-1 flex flex-col space-y-4 min-w-0">
            
            {selectedCreative ? (
              <>
                {/* Mobile Back Button Bar */}
                {isMobile && (
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-[16px] border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
                    <button
                      onClick={() => setMobileView('list')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] hover:text-[#3478F6] p-1 rounded-full"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Todos os Criativos</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#F5F5F5] border border-[#E5E5E5]">
                        {selectedCreative.code}
                      </span>
                      <button
                        onClick={() => setIsMobileSyncOpen(true)}
                        className="p-2 rounded-full bg-[#3478F6] text-white"
                        title="Conectar Celular"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Creative Header & Production Stats Card */}
                <div className="bg-white rounded-[16px] p-4 sm:p-5 border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.04)] space-y-3.5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Title, Code & Status */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#1A1A1A] text-white">
                          {selectedCreative.code}
                        </span>
                        
                        <select
                          value={selectedCreative.status}
                          onChange={(e) => handleStatusChange(e.target.value as CreativeStatus)}
                          className="text-xs font-semibold px-3 py-1 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] text-[#1A1A1A] cursor-pointer focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20"
                        >
                          {(['idea', 'scripted', 'recording', 'done', 'approved'] as CreativeStatus[]).map((st) => (
                            <option key={st} value={st}>
                              {STATUS_LABELS[st].label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] tracking-[-0.02em]">
                        {selectedCreative.title}
                      </h2>

                      {/* Video Estimated Stats Chips */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#525252] mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F5] text-[#1A1A1A] font-semibold border border-[#EFEFEF]">
                          <Clock className="w-3.5 h-3.5 text-[#3478F6]" />
                          ~{totalEstimatedSeconds}s duração estimada
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F5F5] text-[#525252] border border-[#EFEFEF]">
                          {scenes.length} cenas
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F5F5] text-[#525252] border border-[#EFEFEF]">
                          {totalWords} palavras
                        </span>
                        {audioTakesCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f1faf4] text-[#0f8b37] border border-[#b8e4c6] font-semibold">
                            <Mic className="w-3.5 h-3.5" />
                            {audioTakesCount} {audioTakesCount === 1 ? 'take' : 'takes'} de áudio
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons (Pill shape per Design System) */}
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                      <button
                        onClick={() => setIsMobileSyncOpen(true)}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-[#3478F6] hover:bg-[#2c65cf] text-white flex items-center gap-1.5 transition-colors shadow-xs"
                        title="Conectar com o celular via QR Code"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Conectar Celular</span>
                      </button>

                      <button
                        onClick={() => setIsExportZipOpen(true)}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] border border-[#D4D4D4] shadow-xs flex items-center gap-1.5 transition-colors"
                        title="Exportar roteiro e áudios em ZIP"
                      >
                        <Download className="w-3.5 h-3.5 text-[#737373]" />
                        <span>Exportar ZIP</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCreative(selectedCreative.id)}
                        className="p-2 rounded-full text-[#737373] hover:text-[#F33D3D] hover:bg-[#fef3f3] transition-colors"
                        title="Excluir criativo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Hook Spotlight Box */}
                  {selectedCreative.hook && (
                    <div className="p-3.5 rounded-xl bg-[#fcf7f0] border border-[#eed7b6] flex items-start gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.04em] px-2 py-0.5 rounded-full bg-[#f7ecdd] text-[#875207] shrink-0 mt-0.5">
                        Gancho Inicial
                      </span>
                      <p className="text-xs font-medium text-[#472c04] italic">
                        &ldquo;{selectedCreative.hook}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedCreative.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedCreative.tags.map((tag, idx) => (
                        <span key={idx} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Workflow Navigation Tabs: 3 Pilares Fundamentais (Roteiro, Áudio, Material dos Vídeos) */}
                <div className="flex items-center gap-1 p-1 bg-[#F5F5F5] rounded-full border border-[#EFEFEF] w-full sm:w-fit overflow-x-auto scrollbar-none">
                  <button
                    id="tab-scenes-view"
                    onClick={() => setActiveTab('scenes')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      activeTab === 'scenes' || activeTab === 'prompter'
                        ? 'bg-white text-[#1A1A1A] shadow-[0_1px_2px_rgba(10,10,10,0.05)]'
                        : 'text-[#737373] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 ${activeTab === 'scenes' || activeTab === 'prompter' ? 'text-[#3478F6]' : 'text-[#737373]'}`} />
                    <span>1. Roteiro & Prompter ({scenes.length})</span>
                  </button>

                  <button
                    id="tab-audio-view"
                    onClick={() => setActiveTab('audio')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      activeTab === 'audio'
                        ? 'bg-white text-[#1A1A1A] shadow-[0_1px_2px_rgba(10,10,10,0.05)]'
                        : 'text-[#737373] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <Mic className={`w-3.5 h-3.5 ${activeTab === 'audio' ? 'text-[#3478F6]' : 'text-[#737373]'}`} />
                    <span>2. Gravação de Áudio</span>
                  </button>

                  <button
                    id="tab-materials-view"
                    onClick={() => setActiveTab('materials')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      activeTab === 'materials'
                        ? 'bg-white text-[#1A1A1A] shadow-[0_1px_2px_rgba(10,10,10,0.05)]'
                        : 'text-[#737373] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <Film className={`w-3.5 h-3.5 ${activeTab === 'materials' ? 'text-[#3478F6]' : 'text-[#737373]'}`} />
                    <span>3. Material dos Vídeos ({assets.filter(a => a.type !== 'audio').length})</span>
                  </button>
                </div>

                {/* Tab Content Display */}
                {activeTab === 'scenes' && (
                  <SceneEditor
                    creative={selectedCreative}
                    scenes={scenes}
                    onScenesUpdated={refreshScenes}
                    onOpenAiAssist={() => setIsAiAssistOpen(true)}
                    onOpenPrompter={() => setActiveTab('prompter')}
                  />
                )}

                {activeTab === 'prompter' && (
                  <Teleprompter
                    creative={selectedCreative}
                    scenes={scenes}
                    onClosePrompter={() => setActiveTab('scenes')}
                  />
                )}

                {activeTab === 'audio' && (
                  <AudioStudio
                    creative={selectedCreative}
                    scenes={scenes}
                    assets={assets}
                    onAssetsUpdated={refreshAssets}
                  />
                )}

                {activeTab === 'materials' && (
                  <VideoMaterials
                    creative={selectedCreative}
                    scenes={scenes}
                    assets={assets}
                    onAssetsUpdated={refreshAssets}
                  />
                )}
              </>
            ) : (
              /* Empty state if no creative selected */
              <div className="flex-1 bg-white rounded-[20px] p-10 border border-[#E5E5E5] text-center flex flex-col items-center justify-center space-y-4 shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
                <div className="w-16 h-16 rounded-[16px] bg-[#f3f7fe] border border-[#c2d7fc] flex items-center justify-center text-[#3478F6]">
                  <Film className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] text-base tracking-[-0.02em]">Nenhum criativo selecionado</h3>
                  <p className="text-xs text-[#737373] max-w-sm mt-1">
                    Crie seu primeiro criativo ou selecione um existente na lista para começar a produzir roteiros e gravar.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreativeModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-[#3478F6] hover:bg-[#2c65cf] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    + Criar Novo Criativo
                  </button>
                  <button
                    onClick={() => setIsAiAssistOpen(true)}
                    className="px-4 py-2 rounded-full bg-[#f3f7fe] hover:bg-[#e3ecfe] text-[#2c65cf] text-xs font-semibold transition-colors"
                  >
                    Gerar com IA
                  </button>
                </div>
              </div>
            )}

          </main>
        )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Smartphones) */}
      {/* ======================================================== */}
      {isMobile && selectedCreative && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
          <button
            onClick={() => {
              setMobileView('detail');
              setActiveTab('scenes');
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              activeTab === 'scenes' && mobileView === 'detail' ? 'text-[#3478F6]' : 'text-[#737373]'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Roteiro</span>
          </button>

          <button
            onClick={() => {
              setMobileView('detail');
              setActiveTab('prompter');
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
              activeTab === 'prompter' && mobileView === 'detail' 
                ? 'text-[#3478F6]' 
                : 'text-[#525252]'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#3478F6] text-white flex items-center justify-center -mt-3 shadow-md">
              <Tv className="w-5 h-5" />
            </div>
            <span>Prompter</span>
          </button>

          <button
            onClick={() => {
              setMobileView('detail');
              setActiveTab('audio');
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              activeTab === 'audio' && mobileView === 'detail' ? 'text-[#3478F6]' : 'text-[#737373]'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>Áudio</span>
          </button>

          <button
            onClick={() => {
              setMobileView('detail');
              setActiveTab('materials');
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              activeTab === 'materials' && mobileView === 'detail' ? 'text-[#3478F6]' : 'text-[#737373]'
            }`}
          >
            <Film className="w-5 h-5" />
            <span>Materiais</span>
          </button>

          <button
            onClick={() => setIsExportZipOpen(true)}
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-[#737373] hover:text-[#1A1A1A] transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </button>
        </nav>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        existingProject={editingProject}
        onProjectSaved={(savedProj) => {
          setProjects(prev => {
            const idx = prev.findIndex(p => p.id === savedProj.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = savedProj;
              return copy;
            }
            return [...prev, savedProj];
          });
          setSelectedProject(savedProj);
          setEditingProject(null);
        }}
      />

      <CreativeModal
        isOpen={isCreativeModalOpen}
        onClose={() => setIsCreativeModalOpen(false)}
        projects={projects}
        defaultProjectId={selectedProject?.id}
        onCreativeSaved={(newCr) => {
          setCreatives(prev => [newCr, ...prev]);
          setAllCreatives(prev => [newCr, ...prev]);
          setSelectedCreative(newCr);
          setMobileView('detail');
          refreshScenes();
        }}
      />

      <MobileSyncModal
        isOpen={isMobileSyncOpen}
        onClose={() => setIsMobileSyncOpen(false)}
        creative={selectedCreative}
      />

      <AiScriptAssistant
        isOpen={isAiAssistOpen}
        onClose={() => setIsAiAssistOpen(false)}
        creative={selectedCreative}
        onCreativeUpdated={refreshCreatives}
        onScenesUpdated={refreshScenes}
      />

      {selectedCreative && (
        <ExportZipModal
          isOpen={isExportZipOpen}
          onClose={() => setIsExportZipOpen(false)}
          creative={selectedCreative}
          scenes={scenes}
          assets={assets}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-500 text-sm font-medium">
        Carregando Creative Hub...
      </div>
    }>
      <CreativeHubMain />
    </Suspense>
  );
}
