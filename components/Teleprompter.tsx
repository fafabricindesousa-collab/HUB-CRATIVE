'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Scene, Creative } from '@/types/creative';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  Minimize, 
  FlipHorizontal, 
  Type, 
  Gauge, 
  Sun, 
  Moon,
  ChevronDown,
  ChevronUp,
  X,
  Smartphone,
  CheckCircle2,
  Tv
} from 'lucide-react';

interface TeleprompterProps {
  creative: Creative;
  scenes: Scene[];
  onClosePrompter?: () => void;
  isStandalone?: boolean;
}

export const Teleprompter: React.FC<TeleprompterProps> = ({
  creative,
  scenes,
  onClosePrompter,
  isStandalone = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(3); // 1 to 10
  const [fontSize, setFontSize] = useState<number>(32); // px
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showStatusToast, setShowStatusToast] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  // Smooth scroll loop
  useEffect(() => {
    if (!isPlaying || countdown !== null) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (containerRef.current) {
        const pixelsPerSecond = speed * 24;
        containerRef.current.scrollTop += pixelsPerSecond * delta;
      }
      scrollAnimRef.current = requestAnimationFrame(step);
    };

    scrollAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isPlaying, speed, countdown]);

  const togglePlay = React.useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setCountdown(null);
      setShowStatusToast('Pausado');
    } else {
      setCountdown(3);
      setShowStatusToast(null);
    }
  }, [isPlaying]);

  // Toast clear timeout
  useEffect(() => {
    if (showStatusToast) {
      const t = setTimeout(() => setShowStatusToast(null), 1200);
      return () => clearTimeout(t);
    }
  }, [showStatusToast]);

  // Spacebar toggle play/pause & arrow speed controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSpeed((prev) => Math.min(prev + 1, 10));
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSpeed((prev) => Math.max(prev - 1, 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  // Countdown timer logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 1) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 700);
      return () => clearTimeout(timer);
    } else if (countdown === 1) {
      const timer = setTimeout(() => {
        setCountdown(null);
        setIsPlaying(true);
        setShowStatusToast('Rolando');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const resetScroll = () => {
    setIsPlaying(false);
    setCountdown(null);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowStatusToast('Reiniciado');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Combine full script text if scenes exist, or fallback to creative script
  const hasScenes = scenes && scenes.length > 0;

  return (
    <div className={`relative flex flex-col rounded-[16px] overflow-hidden border shadow-[0_4px_20px_rgba(10,10,10,0.08)] transition-all ${
      isDarkTheme 
        ? 'bg-[#121212] text-[#F5F5F5] border-[#262626]' 
        : 'bg-[#FAFAFA] text-[#1A1A1A] border-[#E5E5E5]'
    } ${isFullscreen || isStandalone ? 'fixed inset-0 z-50 rounded-none border-0 h-screen' : 'h-[620px]'}`}>
      
      {/* Teleprompter Top Navigation Bar */}
      <div className={`flex flex-wrap items-center justify-between p-2.5 sm:p-3.5 gap-2 border-b backdrop-blur-md z-20 ${
        isDarkTheme 
          ? 'bg-[#1A1A1A]/95 border-[#262626] text-[#F5F5F5]' 
          : 'bg-white/95 border-[#E5E5E5] text-[#1A1A1A]'
      }`}>
        
        {/* Left: Speed & Font Controls with Touch Targets */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Speed Selector */}
          <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full border text-xs font-semibold ${
            isDarkTheme ? 'bg-[#262626] border-[#404040]' : 'bg-[#F5F5F5] border-[#E5E5E5]'
          }`}>
            <Gauge className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
            <button
              onClick={() => setSpeed(s => Math.max(1, s - 1))}
              className={`w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                isDarkTheme ? 'hover:bg-[#404040] active:bg-[#525252]' : 'hover:bg-[#E5E5E5] active:bg-[#D4D4D4]'
              }`}
              aria-label="Diminuir velocidade"
            >
              -
            </button>
            <span className="w-5 text-center font-mono font-bold text-[#3478F6]">{speed}x</span>
            <button
              onClick={() => setSpeed(s => Math.min(10, s + 1))}
              className={`w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                isDarkTheme ? 'hover:bg-[#404040] active:bg-[#525252]' : 'hover:bg-[#E5E5E5] active:bg-[#D4D4D4]'
              }`}
              aria-label="Aumentar velocidade"
            >
              +
            </button>
          </div>

          {/* Font Size Adjust */}
          <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full border text-xs ${
            isDarkTheme ? 'bg-[#262626] border-[#404040]' : 'bg-[#F5F5F5] border-[#E5E5E5]'
          }`}>
            <Type className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-[#A3A3A3]' : 'text-[#737373]'}`} />
            <button
              onClick={() => setFontSize(f => Math.max(20, f - 4))}
              className={`w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-full font-bold transition-colors ${
                isDarkTheme ? 'hover:bg-[#404040] active:bg-[#525252]' : 'hover:bg-[#E5E5E5] active:bg-[#D4D4D4]'
              }`}
              aria-label="Diminuir fonte"
            >
              -
            </button>
            <span className={`font-mono text-xs px-0.5 font-semibold ${isDarkTheme ? 'text-[#F5F5F5]' : 'text-[#1A1A1A]'}`}>{fontSize}</span>
            <button
              onClick={() => setFontSize(f => Math.min(72, f + 4))}
              className={`w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-full font-bold transition-colors ${
                isDarkTheme ? 'hover:bg-[#404040] active:bg-[#525252]' : 'hover:bg-[#E5E5E5] active:bg-[#D4D4D4]'
              }`}
              aria-label="Aumentar fonte"
            >
              +
            </button>
          </div>
        </div>

        {/* Right Options: Mirror, Theme, Fullscreen, Close */}
        <div className="flex items-center gap-1">
          {/* Mirror Flip */}
          <button
            id="btn-prompter-mirror"
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2 min-w-[36px] min-h-[36px] rounded-full text-xs transition-colors flex items-center justify-center border ${
              isMirrored 
                ? 'bg-[#3478F6]/20 text-[#3478F6] border-[#3478F6]/40' 
                : isDarkTheme 
                  ? 'border-transparent hover:bg-[#262626] text-[#A3A3A3]' 
                  : 'border-transparent hover:bg-[#EFEFEF] text-[#737373]'
            }`}
            title="Modo Espelho"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`p-2 min-w-[36px] min-h-[36px] rounded-full transition-colors flex items-center justify-center ${
              isDarkTheme ? 'hover:bg-[#262626] text-[#A3A3A3]' : 'hover:bg-[#EFEFEF] text-[#737373]'
            }`}
            title="Alternar Tema Claro/Escuro"
          >
            {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            id="btn-prompter-fullscreen"
            onClick={toggleFullscreen}
            className={`p-2 min-w-[36px] min-h-[36px] rounded-full transition-colors flex items-center justify-center ${
              isDarkTheme ? 'hover:bg-[#262626] text-[#A3A3A3]' : 'hover:bg-[#EFEFEF] text-[#737373]'
            }`}
            title="Tela Cheia"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {onClosePrompter && (
            <button
              onClick={onClosePrompter}
              className="p-2 min-w-[36px] min-h-[36px] rounded-full hover:bg-[#F33D3D]/10 text-[#F33D3D] transition-colors ml-0.5 flex items-center justify-center"
              title="Sair do Prompter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
          <span className="text-8xl md:text-9xl font-extrabold text-[#3478F6] animate-pulse">
            {countdown}
          </span>
          <p className="text-[#A3A3A3] text-xs sm:text-sm mt-4 font-bold uppercase tracking-widest">
            A gravação vai começar...
          </p>
        </div>
      )}

      {/* Quick Status Toast */}
      {showStatusToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-[#1A1A1A]/95 text-white border border-[#404040] text-xs font-semibold tracking-wide shadow-lg">
          {showStatusToast}
        </div>
      )}

      {/* Center Reading Eye-Line Focus Bar */}
      <div className="absolute top-1/3 left-0 right-0 h-16 pointer-events-none border-y border-[#3478F6]/30 bg-[#3478F6]/5 z-10 flex items-center justify-between px-4">
        <span className="text-[10px] font-bold text-[#3478F6]/70 uppercase tracking-widest">
          ◄ Linha de Olhar
        </span>
        <span className="text-[10px] font-bold text-[#3478F6]/70 uppercase tracking-widest hidden sm:inline">
          Mantenha os olhos na lente ►
        </span>
      </div>

      {/* Prompter Scrolling Text Canvas (Tap to pause/play) */}
      <div
        ref={containerRef}
        onClick={togglePlay}
        className={`flex-1 overflow-y-auto px-4 sm:px-12 md:px-24 py-36 transition-all select-none cursor-pointer scrollbar-none ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
      >
        <div className="max-w-3xl mx-auto space-y-12 pointer-events-none">
          
          {/* Header Title in Prompter */}
          <div className="pb-8 border-b border-[#262626] text-center">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#3478F6] block mb-2">
              {creative.code} &bull; {creative.title}
            </span>
            <p className="text-xs text-[#737373] font-normal">
              Toque na tela a qualquer momento para pausar ou continuar.
            </p>
          </div>

          {/* Render Scenes or Plain Script */}
          {hasScenes ? (
            scenes.map((sc) => (
              <div 
                key={sc.id} 
                className="group relative transition-opacity duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#3478F6]/20 text-[#3478F6] border border-[#3478F6]/30">
                    {sc.title}
                  </span>
                  {sc.visualInstruction && (
                    <span className="text-xs text-[#737373] italic">
                      [{sc.visualInstruction}]
                    </span>
                  )}
                </div>

                <p className="font-semibold tracking-tight text-justify whitespace-pre-line leading-relaxed">
                  {sc.speech}
                </p>

                {sc.brollInstruction && (
                  <div className="mt-2 text-xs text-[#12A642] font-medium">
                    &bull; Insere na tela: {sc.brollInstruction}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="font-semibold tracking-tight whitespace-pre-line">
              {creative.script || creative.hook}
            </div>
          )}

          {/* End of Script Spacer */}
          <div className="py-44 text-center text-sm font-bold text-[#737373] uppercase tracking-widest border-t border-[#262626]">
            Fim do Roteiro
          </div>

        </div>
      </div>

      {/* Prompter Bottom Bar with Thumb-Friendly Play Controls */}
      <div className={`px-4 py-3 text-xs flex items-center justify-between border-t z-20 gap-3 pb-safe ${
        isDarkTheme ? 'bg-[#1A1A1A] border-[#262626] text-[#A3A3A3]' : 'bg-white border-[#E5E5E5] text-[#737373]'
      }`}>
        <div className="flex items-center gap-2">
          <button
            id="btn-prompter-reset"
            onClick={resetScroll}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors border ${
              isDarkTheme 
                ? 'bg-[#262626] border-[#404040] text-[#A3A3A3] hover:text-white' 
                : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#737373] hover:text-[#1A1A1A]'
            }`}
            title="Voltar ao início do roteiro"
            aria-label="Voltar ao início"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-[#12A642] animate-pulse' : 'bg-[#F59E0B]'}`} />
            <span className="font-semibold">{isPlaying ? 'Rolando' : 'Pausado'}</span>
          </div>
        </div>

        {/* Big Thumb Play/Pause Button */}
        <button
          id="btn-prompter-toggle-play"
          onClick={togglePlay}
          className={`flex items-center justify-center gap-2 px-6 h-11 rounded-full text-sm font-bold shadow-md transition-all active:scale-95 ${
            isPlaying 
              ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white' 
              : 'bg-[#3478F6] hover:bg-[#2c65cf] text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Iniciar (3s)</span>
            </>
          )}
        </button>

        {/* Info */}
        <div className="flex items-center gap-2 text-right">
          <span className="font-medium hidden xs:inline">{scenes.length} Cenas</span>
          <span className="font-mono text-[#3478F6] font-bold bg-[#3478F6]/10 px-2.5 py-1 rounded-full">{speed}x</span>
        </div>
      </div>

    </div>
  );
};
