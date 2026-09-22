'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/creative';
import { auth, loginWithGoogle, logoutUser } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Clapperboard, 
  FolderKanban, 
  Smartphone, 
  Plus, 
  Sparkles, 
  LogOut, 
  Tv
} from 'lucide-react';

interface HeaderProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onNewProject: () => void;
  onNewCreative: () => void;
  onOpenMobileSync: () => void;
  onOpenAiAssist: () => void;
  currentView?: 'projects' | 'workspace';
  onNavigateToProjects?: () => void;
  onNavigateToWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onNewProject,
  onNewCreative,
  onOpenMobileSync,
  onOpenAiAssist,
  currentView = 'workspace',
  onNavigateToProjects,
  onNavigateToWorkspace,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (user) {
      await logoutUser();
    } else {
      await loginWithGoogle();
    }
  };

  return (
    <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-30 shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          
          {/* Logo & Brand */}
          <div 
            onClick={onNavigateToProjects}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 cursor-pointer group select-none min-h-[44px]"
            title="Ir para tela de Projetos"
          >
            <div className="w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-[10px] sm:rounded-[12px] bg-[#3478F6] text-white flex items-center justify-center font-extrabold text-xs sm:text-[13px] tracking-[-0.02em] shadow-xs group-hover:bg-[#2c65cf] transition-colors">
              MC
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-[#1A1A1A] text-sm sm:text-base tracking-[-0.02em] group-hover:text-[#3478F6] transition-colors">
                  Creative Hub
                </span>
                {selectedProject && (
                  <span className="inline-flex sm:hidden items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#1a1a1a] border border-[#e5e5e5] max-w-[90px] truncate">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: selectedProject.color || '#3478F6' }} />
                    <span className="truncate">{selectedProject.name}</span>
                  </span>
                )}
                <span className="hidden lg:inline-flex text-[10px] font-bold uppercase tracking-[0.04em] px-2 py-0.5 rounded-full bg-[#f3f7fe] text-[#2c65cf]">
                  PC ↔ Celular
                </span>
              </div>
              <p className="text-[11px] text-[#737373] hidden sm:block">
                Roteiros, Áudio & Teleprompter
              </p>
            </div>
          </div>

          {/* Central Navigation: Clear View Switcher (Visible on sm+) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#F5F5F5] p-1 rounded-full border border-[#EFEFEF]">
            <button
              id="nav-btn-projects"
              onClick={onNavigateToProjects}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                currentView === 'projects'
                  ? 'bg-white text-[#1A1A1A] shadow-[0_1px_2px_rgba(10,10,10,0.06)]'
                  : 'text-[#737373] hover:text-[#1A1A1A]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#3478F6]" />
              <span>Campanhas ({projects.length})</span>
            </button>

            {selectedProject && (
              <button
                id="nav-btn-workspace"
                onClick={onNavigateToWorkspace}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  currentView === 'workspace'
                    ? 'bg-white text-[#1A1A1A] shadow-[0_1px_2px_rgba(10,10,10,0.06)]'
                    : 'text-[#737373] hover:text-[#1A1A1A]'
                }`}
              >
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: selectedProject.color || '#3478F6' }}
                />
                <span className="truncate max-w-[100px] sm:max-w-[160px] font-medium">
                  {selectedProject.name}
                </span>
              </button>
            )}
          </div>

          {/* Right Actions: Mobile-first responsive touch targets */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* AI Assistant Button */}
            <button
              id="btn-open-ai-assist"
              onClick={onOpenAiAssist}
              className="w-9 h-9 sm:w-auto sm:px-3.5 sm:h-[38px] rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#f3f7fe] hover:bg-[#e3ecfe] text-[#2c65cf] transition-all"
              title="Gerar roteiros com Inteligência Artificial"
            >
              <Sparkles className="w-4 h-4 text-[#3478F6]" />
              <span className="hidden md:inline">IA Assistente</span>
            </button>

            {/* Quick Action (+) button: New Creative or Project */}
            {currentView === 'projects' ? (
              <button
                id="btn-header-new-project"
                onClick={onNewProject}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 h-9 sm:h-[38px] rounded-full text-xs font-semibold bg-[#3478F6] hover:bg-[#2c65cf] text-white shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Campanha</span>
                <span className="sm:hidden">Campanha</span>
              </button>
            ) : (
              <button
                id="btn-new-creative"
                onClick={onNewCreative}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 h-9 sm:h-[38px] rounded-full text-xs font-semibold bg-[#1A1A1A] hover:bg-[#333333] text-white shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Vídeo</span>
                <span className="sm:hidden">Vídeo</span>
              </button>
            )}

            {/* Connect Mobile Highlight Button */}
            <button
              id="btn-open-mobile-sync"
              onClick={onOpenMobileSync}
              className="w-9 h-9 sm:w-auto sm:px-3.5 sm:h-[38px] rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#f3f7fe] hover:bg-[#e3ecfe] text-[#2c65cf] border border-[#d6e5fd] shadow-xs transition-all"
              title="Conectar smartphone via QR Code para usar como Teleprompter"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Celular</span>
            </button>

            {/* User Profile / Google Login */}
            <div className="pl-1 border-l border-[#E5E5E5] ml-0.5">
              {!authLoading && (
                <button
                  id="btn-auth-toggle"
                  onClick={handleAuth}
                  className="flex items-center justify-center min-w-[36px] min-h-[36px] p-1 rounded-full hover:bg-[#F5F5F5] text-xs text-[#525252] transition-colors"
                  title={user ? `Conectado como ${user.email}. Clique para sair.` : 'Conectar Conta Google'}
                >
                  {user ? (
                    <div className="flex items-center gap-1.5">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'Avatar'} 
                          className="w-7 h-7 rounded-full border border-[#D4D4D4]"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#3478F6] text-white flex items-center justify-center font-bold text-xs">
                          {user.email?.[0].toUpperCase() || 'U'}
                        </div>
                      )}
                      <LogOut className="w-3.5 h-3.5 text-[#737373] hover:text-[#F33D3D] hidden sm:block" />
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-[#2c65cf] hover:text-[#1b3e80] px-2 py-1 rounded-full bg-[#f3f7fe]">
                      Entrar
                    </span>
                  )}
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
