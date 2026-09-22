'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Creative } from '@/types/creative';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode as QrIcon, 
  Tv, 
  Mic, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface MobileSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  creative: Creative | null;
}

export const MobileSyncModal: React.FC<MobileSyncModalProps> = ({
  isOpen,
  onClose,
  creative,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const syncUrl = typeof window !== 'undefined'
    ? (creative 
        ? `${window.location.origin}?creativeId=${creative.id}&view=prompter`
        : `${window.location.origin}?view=prompter`)
    : '';

  useEffect(() => {
    if (syncUrl) {
      QRCode.toDataURL(syncUrl, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#171717',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Erro ao gerar QR Code:', err));
    }
  }, [syncUrl]);

  const handleCopy = async () => {
    if (!syncUrl) return;
    try {
      await navigator.clipboard.writeText(syncUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-t-[24px] sm:rounded-[20px] max-w-lg w-full p-5 sm:p-6 shadow-[0_8px_30px_rgba(10,10,10,0.16)] border border-[#E5E5E5] relative max-h-[92vh] overflow-y-auto pb-safe">
        
        {/* Close Button */}
        <button
          id="btn-close-mobile-sync"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#eff5ff] text-[#3478F6] border border-[#d6e5fd] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#1A1A1A] text-base sm:text-lg tracking-tight">
                Conectar PC ao Celular
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f1faf4] text-[#0f8b37] border border-[#b8e4c6] uppercase tracking-wide">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-[#737373]">
              {creative 
                ? `Sincronizando: ${creative.code} - ${creative.title}` 
                : 'Abra o Teleprompter em tela cheia no smartphone'}
            </p>
          </div>
        </div>

        {/* Dynamic Visual Connection diagram */}
        <div className="p-3.5 rounded-[12px] bg-[#1A1A1A] text-white flex items-center justify-between mb-5 border border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center text-[#D4D4D4]">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#F5F5F5]">No Computador</p>
              <p className="text-[11px] text-[#A3A3A3]">Edite o roteiro & IA</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#3478F6]">
            <span className="text-xs font-mono font-bold tracking-widest">····</span>
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3478F6]/20 text-[#3478F6] border border-[#3478F6]/30 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3478F6]">No Celular</p>
              <p className="text-[11px] text-[#A3A3A3]">Teleprompter & Gravação</p>
            </div>
          </div>
        </div>

        {/* QR Code Presentation */}
        <div className="flex flex-col items-center justify-center p-5 bg-[#FAFAFA] rounded-[12px] border border-[#E5E5E5] mb-5">
          <div className="relative p-2.5 bg-white rounded-xl border border-[#E5E5E5] shadow-xs">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code para celular" 
                className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg"
              />
            ) : (
              <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-[#A3A3A3]">
                <QrIcon className="w-12 h-12 animate-pulse" />
              </div>
            )}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1A1A1A] text-white text-[10px] font-semibold whitespace-nowrap shadow-xs">
              Apontar Câmera
            </div>
          </div>
          
          <p className="text-xs text-[#737373] mt-4 font-normal text-center max-w-xs">
            Abra a câmera do seu smartphone (iOS ou Android) e toque no link detectado para abrir o teleprompter em tela inteira.
          </p>
        </div>

        {/* Quick Features Highlight */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]">
            <div className="w-7 h-7 rounded-lg bg-[#eff5ff] text-[#3478F6] flex items-center justify-center shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">Teleprompter 9:16</p>
              <p className="text-[11px] text-[#737373]">Toque para pausar</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]">
            <div className="w-7 h-7 rounded-lg bg-[#f1faf4] text-[#0f8b37] flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">Gravação de Áudio</p>
              <p className="text-[11px] text-[#737373]">Microfone direto</p>
            </div>
          </div>
        </div>

        {/* Direct Link Alternative */}
        <div className="space-y-1.5 mb-5">
          <label className="text-xs font-semibold text-[#1A1A1A] block">
            Ou copie o link direto para abrir no celular:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={syncUrl}
              className="w-full text-xs px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#D4D4D4] text-[#1A1A1A] truncate font-mono focus:outline-none"
            />
            <button
              id="btn-copy-mobile-link"
              onClick={handleCopy}
              className="px-4 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#12A642]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#EFEFEF]">
          <a
            href={syncUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#3478F6] hover:text-[#2c65cf] flex items-center gap-1.5 underline-offset-4 hover:underline"
          >
            <span>Testar modo celular em nova aba</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#F5F5F5] hover:bg-[#EFEFEF] text-[#1A1A1A] font-semibold text-xs transition-colors"
          >
            Concluído
          </button>
        </div>

      </div>
    </div>
  );
};
