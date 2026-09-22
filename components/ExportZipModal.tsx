'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import { Creative, Scene, Asset } from '@/types/creative';
import { X, Archive, Download, Check, FileText, FileSpreadsheet } from 'lucide-react';

interface ExportZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creative: Creative;
  scenes: Scene[];
  assets: Asset[];
}

export const ExportZipModal: React.FC<ExportZipModalProps> = ({
  isOpen,
  onClose,
  creative,
  scenes,
  assets,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folderName = `${creative.code}_${creative.title.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const folder = zip.folder(folderName) || zip;

      // 1. Markdown full script
      let markdownContent = `# ${creative.code} - ${creative.title}\n\n`;
      markdownContent += `**Status:** ${creative.status.toUpperCase()}\n`;
      markdownContent += `**Tags:** ${creative.tags.join(', ')}\n`;
      markdownContent += `**Data de Exportação:** ${new Date().toLocaleDateString('pt-BR')}\n\n`;
      markdownContent += `## 🎯 Gancho (Hook):\n> "${creative.hook}"\n\n`;
      markdownContent += `## 🎬 Roteiro Cena a Cena:\n\n`;

      scenes.forEach((sc, idx) => {
        markdownContent += `### Cena ${idx + 1}: ${sc.title}\n`;
        markdownContent += `**Fala:**\n${sc.speech}\n\n`;
        if (sc.visualInstruction) {
          markdownContent += `*Direção de Câmera / Visual:* ${sc.visualInstruction}\n`;
        }
        if (sc.brollInstruction) {
          markdownContent += `*B-Roll:* ${sc.brollInstruction}\n`;
        }
        if (sc.notes) {
          markdownContent += `*Observações:* ${sc.notes}\n`;
        }
        markdownContent += `\n---\n\n`;
      });

      folder.file('roteiro_completo.md', markdownContent);

      // 2. CSV scenes spreadsheet
      let csvContent = 'Ordem,Titulo,Fala,Direcao_Visual,B_Roll,Observacoes\n';
      scenes.forEach((sc, idx) => {
        const clean = (str?: string) => `"${(str || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        csvContent += `${idx + 1},${clean(sc.title)},${clean(sc.speech)},${clean(sc.visualInstruction)},${clean(sc.brollInstruction)},${clean(sc.notes)}\n`;
      });
      folder.file('tabela_cenas.csv', csvContent);

      // 3. Teleprompter Plain Text
      let teleprompterPlain = `=== ${creative.code}: ${creative.title} ===\n\n`;
      scenes.forEach((sc) => {
        teleprompterPlain += `[${sc.title.toUpperCase()}]\n${sc.speech}\n\n`;
      });
      folder.file('teleprompter_fala_pura.txt', teleprompterPlain);

      // 4. Summary & Media Assets Log
      let assetsSummary = `RELATÓRIO DE TAKES E MÍDIAS - ${creative.code}\nTotal de takes gravados: ${assets.length}\n\n`;
      assets.forEach((a, i) => {
        assetsSummary += `${i + 1}. [${a.type.toUpperCase()}] ${a.originalName} | Duração: ${a.duration || 'N/A'} | Aprovado: ${a.isApproved ? 'SIM' : 'NÃO'} | Data: ${a.createdAt}\n`;
      });
      folder.file('takes_relatorio.txt', assetsSummary);

      // Generate ZIP and trigger browser download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Erro ao gerar arquivo ZIP:', err);
    } finally {
      setIsExporting(false);
    }
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
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A1A] text-base tracking-tight">Exportar Pacote de Produção</h3>
            <p className="text-xs text-[#737373]">Baixe roteiro, planilhas e teleprompter em arquivo .ZIP</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-3.5 bg-[#FAFAFA] rounded-[12px] border border-[#E5E5E5] text-xs space-y-2">
            <span className="font-semibold text-[#1A1A1A] block">Arquivos inclusos no pacote:</span>
            <div className="flex items-center gap-2 text-[#737373]">
              <FileText className="w-4 h-4 text-[#3478F6] shrink-0" />
              <span><strong className="text-[#1A1A1A]">roteiro_completo.md</strong> (Markdown com cenas)</span>
            </div>
            <div className="flex items-center gap-2 text-[#737373]">
              <FileSpreadsheet className="w-4 h-4 text-[#12A642] shrink-0" />
              <span><strong className="text-[#1A1A1A]">tabela_cenas.csv</strong> (Excel / Sheets)</span>
            </div>
            <div className="flex items-center gap-2 text-[#737373]">
              <FileText className="w-4 h-4 text-[#3478F6] shrink-0" />
              <span><strong className="text-[#1A1A1A]">teleprompter_fala_pura.txt</strong> (Texto puro)</span>
            </div>
          </div>
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
            onClick={handleDownloadZip}
            disabled={isExporting || downloadSuccess}
            className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#3478F6] hover:bg-[#2c65cf] text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Compactando...' : 'Baixar ZIP'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
