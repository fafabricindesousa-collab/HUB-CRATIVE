'use client';

import React, { useState, useRef } from 'react';
import { Creative, Scene, Asset, AssetType } from '@/types/creative';
import { saveAsset, deleteAsset } from '@/lib/storage';
import { 
  Film, 
  Image as ImageIcon, 
  FileText, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  UploadCloud, 
  FolderPlus,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';

interface VideoMaterialsProps {
  creative: Creative;
  scenes: Scene[];
  assets: Asset[];
  onAssetsUpdated: () => void;
}

export const VideoMaterials: React.FC<VideoMaterialsProps> = ({
  creative,
  scenes,
  assets,
  onAssetsUpdated,
}) => {
  // Filter materials (exclude raw audio takes if we want materials focused on visual B-rolls/references/images/videos)
  const materials = assets.filter((a) => a.type !== 'audio');

  const [isAddingLink, setIsAddingLink] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkTitle, setLinkTitle] = useState<string>('');
  const [linkNotes, setLinkNotes] = useState<string>('');
  const [selectedSceneId, setSelectedSceneId] = useState<string>('all');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const processFiles = async (fileList: FileList) => {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let assetType: AssetType = 'document';
      if (file.type.startsWith('image/')) assetType = 'image';
      else if (file.type.startsWith('video/')) assetType = 'video';

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const fileUrl = reader.result as string;
        const newAsset: Asset = {
          id: `material_${Date.now()}_${i}`,
          creativeId: creative.id,
          projectId: creative.projectId,
          sceneId: selectedSceneId !== 'all' ? selectedSceneId : undefined,
          type: assetType,
          originalName: file.name,
          url: fileUrl,
          fileSize: file.size,
          isApproved: true,
          source: 'upload',
          notes: selectedSceneId !== 'all' 
            ? `Associado à ${scenes.find(s => s.id === selectedSceneId)?.title || 'Cena'}` 
            : 'Material geral do vídeo',
          ownerId: creative.ownerId,
          createdAt: new Date().toISOString(),
        };

        await saveAsset(newAsset);
        onAssetsUpdated();
      };
    }
  };

  const handleAddLinkMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    const newAsset: Asset = {
      id: `material_link_${Date.now()}`,
      creativeId: creative.id,
      projectId: creative.projectId,
      sceneId: selectedSceneId !== 'all' ? selectedSceneId : undefined,
      type: 'video',
      originalName: linkTitle.trim() || 'Link de Referência / B-Roll',
      url: linkUrl.trim(),
      isApproved: true,
      source: 'upload',
      notes: linkNotes.trim() || 'Link externo (Drive, Dropbox, YouTube ou TikTok de referência)',
      ownerId: creative.ownerId,
      createdAt: new Date().toISOString(),
    };

    await saveAsset(newAsset);
    setLinkUrl('');
    setLinkTitle('');
    setLinkNotes('');
    setIsAddingLink(false);
    onAssetsUpdated();
  };

  const handleDelete = async (assetId: string) => {
    if (confirm('Deseja remover este material?')) {
      await deleteAsset(creative.projectId, creative.id, assetId);
      if (previewAsset?.id === assetId) setPreviewAsset(null);
      onAssetsUpdated();
    }
  };

  const handleToggleApproval = async (asset: Asset) => {
    const updated: Asset = {
      ...asset,
      isApproved: !asset.isApproved,
    };
    await saveAsset(updated);
    onAssetsUpdated();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="bg-white rounded-[16px] p-5 border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff5ff] text-[#2c65cf] border border-[#d6e5fd]">
              <Film className="w-3.5 h-3.5" />
              Material dos Vídeos
            </span>
            <span className="text-xs text-[#737373]">
              {materials.length} {materials.length === 1 ? 'item anexado' : 'itens anexados'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
            B-Rolls, Imagens & Referências do Criativo
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Arquivos, fotos de produtos e links de apoio que o editor precisa para montar o vídeo final.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none justify-center px-4 py-2 sm:py-2 min-h-[40px] rounded-full bg-[#3478F6] hover:bg-[#2c65cf] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Enviar Arquivo</span>
          </button>
          
          <button
            onClick={() => setIsAddingLink(!isAddingLink)}
            className="flex-1 sm:flex-none justify-center px-4 py-2 sm:py-2 min-h-[40px] rounded-full bg-[#F5F5F5] hover:bg-[#EFEFEF] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1.5 border border-[#E5E5E5] transition-colors cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#737373]" />
            <span>Adicionar Link</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      </div>

      {/* Add Link Form Modal / Dropdown */}
      {isAddingLink && (
        <form 
          onSubmit={handleAddLinkMaterial}
          className="bg-white rounded-[16px] p-4 sm:p-5 border border-[#3478F6] shadow-[0_4px_16px_rgba(52,120,246,0.08)] space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#EFEFEF]">
            <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#3478F6]" />
              Anexar Link de Vídeo / B-Roll Externo
            </span>
            <button 
              type="button" 
              onClick={() => setIsAddingLink(false)}
              className="text-xs text-[#737373] hover:text-[#1A1A1A] p-1"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] mb-1">Título do Material</label>
              <input
                type="text"
                placeholder="Ex: Vídeo de B-Roll do Produto no Drive"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="w-full text-sm sm:text-xs px-3 py-2.5 sm:py-2 rounded-lg border border-[#E5E5E5] focus:outline-none focus:border-[#3478F6]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] mb-1">URL / Link</label>
              <input
                type="url"
                placeholder="https://drive.google.com/... ou link de vídeo"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full text-sm sm:text-xs px-3 py-2.5 sm:py-2 rounded-lg border border-[#E5E5E5] focus:outline-none focus:border-[#3478F6]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] mb-1">Associar à Cena (Opcional)</label>
              <select
                value={selectedSceneId}
                onChange={(e) => setSelectedSceneId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#3478F6]"
              >
                <option value="all">Geral (Todo o Vídeo)</option>
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    Cena {s.order}: {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] mb-1">Instrução para Edição</label>
              <input
                type="text"
                placeholder="Ex: Usar aos 0:15 quando o apresentador falar o valor"
                value={linkNotes}
                onChange={(e) => setLinkNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E5E5] focus:outline-none focus:border-[#3478F6]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-[#3478F6] hover:bg-[#2c65cf] text-white text-xs font-semibold shadow-xs"
            >
              Salvar Material
            </button>
          </div>
        </form>
      )}

      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[16px] p-6 text-center transition-all cursor-pointer ${
          isDragging 
            ? 'border-[#3478F6] bg-[#eff5ff]/50 scale-[0.99]' 
            : 'border-[#D4D4D4] hover:border-[#3478F6] bg-[#FAFAFA] hover:bg-white'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#E5E5E5] flex items-center justify-center mx-auto mb-2 text-[#3478F6]">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-[#1A1A1A]">
          Arraste e solte arquivos aqui, ou <span className="text-[#3478F6] underline">clique para selecionar</span>
        </p>
        <p className="text-[11px] text-[#737373] mt-1">
          Suporta imagens (PNG, JPG), vídeos curtos (MP4, MOV) e PDFs de apoio.
        </p>
      </div>

      {/* Materials Visual Grid */}
      {materials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {materials.map((asset) => {
            const isImage = asset.type === 'image' && asset.url.startsWith('data:image');
            const isVideo = asset.type === 'video' && asset.url.startsWith('data:video');
            const isLink = asset.url.startsWith('http');
            const sceneRef = scenes.find((s) => s.id === asset.sceneId);

            return (
              <div
                key={asset.id}
                className="bg-white rounded-[16px] border border-[#E5E5E5] hover:border-[#3478F6] shadow-[0_1px_3px_rgba(10,10,10,0.04)] hover:shadow-[0_4px_16px_rgba(10,10,10,0.06)] overflow-hidden transition-all flex flex-col justify-between group"
              >
                {/* Visual Thumbnail Area */}
                <div className="h-32 bg-[#F5F5F5] relative flex items-center justify-center overflow-hidden border-b border-[#EFEFEF]">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.url}
                      alt={asset.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : isVideo ? (
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : isLink ? (
                    <div className="text-center p-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eff5ff] text-[#3478F6] flex items-center justify-center mx-auto mb-1.5 border border-[#d6e5fd]">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#1A1A1A] line-clamp-1">
                        Link Externo
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] text-[#737373] flex items-center justify-center mx-auto mb-1.5 border border-[#E5E5E5]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#525252]">
                        Documento
                      </span>
                    </div>
                  )}

                  {/* Scene Pill if attached */}
                  {sceneRef && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1A1A1A]/80 text-white backdrop-blur-xs">
                      Cena {sceneRef.order}
                    </span>
                  )}

                  {/* Quick Action Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90">
                    <button
                      onClick={() => handleToggleApproval(asset)}
                      className={`p-1.5 rounded-full shadow-xs transition-colors ${
                        asset.isApproved 
                          ? 'bg-[#12A642] text-white' 
                          : 'bg-white text-[#737373] hover:text-[#12A642]'
                      }`}
                      title={asset.isApproved ? 'Aprovado para edição' : 'Marcar como aprovado'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info & Metadata */}
                <div className="p-3.5 space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-[#1A1A1A] line-clamp-1" title={asset.originalName}>
                    {asset.originalName}
                  </h4>
                  
                  {asset.notes && (
                    <p className="text-[11px] text-[#737373] line-clamp-2 leading-tight">
                      {asset.notes}
                    </p>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 pt-2 border-t border-[#EFEFEF] flex items-center justify-between text-xs">
                  {isLink ? (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3478F6] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Abrir Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href={asset.url}
                      download={asset.originalName}
                      className="text-[#3478F6] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1 rounded text-[#737373] hover:text-[#F33D3D] transition-colors"
                    title="Remover material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-[16px] p-8 text-center border border-[#E5E5E5] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#eff5ff] text-[#3478F6] flex items-center justify-center mx-auto border border-[#d6e5fd]">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#1A1A1A]">Nenhum material anexado ainda</h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            Envie imagens de produtos, b-rolls gravados ou adicione links externos para que a equipe de edição tenha tudo em mãos.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-[#3478F6] hover:bg-[#2c65cf] text-white text-xs font-semibold"
            >
              + Enviar Primeiro Arquivo
            </button>
            <button
              onClick={() => setIsAddingLink(true)}
              className="px-4 py-2 rounded-full bg-[#F5F5F5] hover:bg-[#EFEFEF] text-[#1A1A1A] text-xs font-semibold border border-[#E5E5E5]"
            >
              + Adicionar Link
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {previewAsset && (
        <div 
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-4 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-3">
              <h3 className="text-sm font-bold text-[#1A1A1A]">{previewAsset.originalName}</h3>
              <button 
                onClick={() => setPreviewAsset(null)}
                className="text-xs text-[#737373] hover:text-[#1A1A1A]"
              >
                Fechar
              </button>
            </div>
            {previewAsset.type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewAsset.url} alt={previewAsset.originalName} className="w-full rounded-lg object-contain max-h-[70vh]" />
            )}
          </div>
        </div>
      )}

    </div>
  );
};
