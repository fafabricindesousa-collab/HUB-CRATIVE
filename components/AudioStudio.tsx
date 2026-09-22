'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Creative, Scene, Asset } from '@/types/creative';
import { saveAsset, deleteAsset } from '@/lib/storage';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Radio, 
  Volume2, 
  Clock, 
  Plus, 
  AlertCircle,
  FileAudio
} from 'lucide-react';

interface AudioStudioProps {
  creative: Creative;
  scenes: Scene[];
  assets: Asset[];
  onAssetsUpdated: () => void;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({
  creative,
  scenes,
  assets,
  onAssetsUpdated,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('all');
  const [currentlyPlayingAssetId, setCurrentlyPlayingAssetId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingSecondsRef = useRef<number>(0);

  // Filter only audio takes for this view
  const audioTakes = assets.filter((a) => a.type === 'audio');

  const startRecording = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingSecondsRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const totalSecs = recordingSecondsRef.current;
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;

          const sceneTitle = selectedSceneId !== 'all' 
            ? scenes.find(s => s.id === selectedSceneId)?.title || 'Cena'
            : 'Criativo Completo';

          const newAsset: Asset = {
            id: `audio_${Date.now()}`,
            creativeId: creative.id,
            projectId: creative.projectId,
            sceneId: selectedSceneId !== 'all' ? selectedSceneId : undefined,
            type: 'audio',
            originalName: `Take #${audioTakes.length + 1} - ${sceneTitle}`,
            url: base64Audio,
            duration: durationStr,
            fileSize: audioBlob.size,
            isApproved: false,
            source: 'recorded',
            notes: `Gravado no Audio Studio (${new Date().toLocaleTimeString()})`,
            ownerId: creative.ownerId,
            createdAt: new Date().toISOString(),
          };

          await saveAsset(newAsset);
          onAssetsUpdated();
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingSeconds(recordingSecondsRef.current);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      setAudioError('Não foi possível acessar o microfone. Verifique as permissões no navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const togglePlayAudio = (asset: Asset) => {
    if (currentlyPlayingAssetId === asset.id) {
      audioElementRef.current?.pause();
      setCurrentlyPlayingAssetId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = new Audio(asset.url);
      audioElementRef.current = audio;
      audio.play();
      setCurrentlyPlayingAssetId(asset.id);
      audio.onended = () => setCurrentlyPlayingAssetId(null);
    }
  };

  const toggleApprove = async (asset: Asset) => {
    const updated = { ...asset, isApproved: !asset.isApproved };
    await saveAsset(updated);
    onAssetsUpdated();
  };

  const handleDeleteTake = async (assetId: string) => {
    if (currentlyPlayingAssetId === assetId) {
      audioElementRef.current?.pause();
      setCurrentlyPlayingAssetId(null);
    }
    await deleteAsset(creative.projectId, creative.id, assetId);
    onAssetsUpdated();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* Studio Recorder Card */}
      <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-[#EFEFEF]">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2 tracking-tight">
              <Mic className="w-5 h-5 text-[#3478F6]" />
              Estúdio de Gravação de Áudio & Takes
            </h3>
            <p className="text-xs text-[#737373] mt-0.5">
              Grave locuções cena por cena ou o áudio completo do criativo em alta fidelidade.
            </p>
          </div>

          {/* Target Scene Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#737373] shrink-0">Alvo:</span>
            <select
              value={selectedSceneId}
              onChange={(e) => setSelectedSceneId(e.target.value)}
              className="w-full sm:w-auto text-sm sm:text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] text-[#1A1A1A] focus:outline-none focus:border-[#3478F6] focus:ring-[3px] focus:ring-[#3478F6]/20"
            >
              <option value="all">Roteiro Completo (Todas as Cenas)</option>
              {scenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {audioError && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#fef3f3] text-[#F33D3D] text-xs flex items-center gap-2 border border-[#fad2d2]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{audioError}</span>
          </div>
        )}

        {/* Live Recording Controller Box */}
        <div className="mt-5 flex flex-col items-center justify-center p-8 rounded-[16px] bg-[#1A1A1A] text-white relative overflow-hidden border border-[#262626]">
          {/* Animated Audio Waveform Background */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-25 pointer-events-none">
              {[40, 75, 95, 60, 30, 85, 100, 70, 45, 90, 60, 35, 80, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-[#3478F6] rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i * 0.1).toFixed(1)}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="z-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              {isRecording ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F33D3D]/20 text-[#F33D3D] border border-[#F33D3D]/30 text-xs font-bold animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  GRAVANDO
                </div>
              ) : (
                <div className="text-xs font-semibold text-[#A3A3A3]">
                  Pronto para gravar
                </div>
              )}
              <div className="text-3xl font-mono font-bold tracking-widest text-[#3478F6]">
                {formatTime(recordingSeconds)}
              </div>
            </div>

            {/* Record / Stop Button */}
            {!isRecording ? (
              <button
                id="btn-start-audio-recording"
                onClick={startRecording}
                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-[#F33D3D] hover:bg-[#d82a2a] text-white flex items-center justify-center shadow-lg shadow-[#F33D3D]/30 active:scale-95 transition-all ring-4 ring-[#F33D3D]/20 cursor-pointer"
                title="Iniciar Gravação de Áudio"
              >
                <Mic className="w-8 h-8 sm:w-7 sm:h-7" />
              </button>
            ) : (
              <button
                id="btn-stop-audio-recording"
                onClick={stopRecording}
                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-white hover:bg-[#FAFAFA] text-[#1A1A1A] flex items-center justify-center shadow-xl active:scale-95 transition-all ring-4 ring-white/20 animate-pulse cursor-pointer"
                title="Finalizar e Salvar Take"
              >
                <Square className="w-7 h-7 sm:w-6 sm:h-6 fill-current text-[#F33D3D]" />
              </button>
            )}

            <p className="text-xs text-[#A3A3A3] max-w-sm text-center">
              {isRecording 
                ? 'Fale com clareza próximo ao microfone do celular. Toque no botão quadrado para finalizar.' 
                : 'Toque no botão vermelho acima para gravar um take de voz.'}
            </p>
          </div>
        </div>
      </div>

      {/* Takes List & Asset Approvals */}
      <div className="bg-white rounded-[16px] p-4 sm:p-6 border border-[#E5E5E5] shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
        <div className="flex items-center justify-between pb-4 border-b border-[#EFEFEF]">
          <div>
            <h4 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#3478F6]" />
              Takes de Áudio Gravados ({audioTakes.length})
            </h4>
            <p className="text-xs text-[#737373] mt-0.5">
              Ouça os takes gravados, selecione o melhor e aprove para a edição final.
            </p>
          </div>
        </div>

        {audioTakes.length === 0 ? (
          <div className="py-12 text-center text-[#737373]">
            <FileAudio className="w-10 h-10 mx-auto text-[#A3A3A3] mb-2" />
            <p className="text-xs font-medium">Nenhum take gravado ainda.</p>
            <p className="text-[11px] text-[#A3A3A3] mt-1">
              Grave seu primeiro áudio pelo estúdio acima.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EFEFEF] mt-2">
            {audioTakes.map((take) => {
              const isPlaying = currentlyPlayingAssetId === take.id;
              return (
                <div
                  key={take.id}
                  className={`py-3.5 px-3 rounded-[14px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    take.isApproved ? 'bg-[#f1faf4] border border-[#b8e4c6]' : 'hover:bg-[#FAFAFA]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlayAudio(take)}
                      className={`w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                        isPlaying
                          ? 'bg-[#3478F6] text-white'
                          : 'bg-[#1A1A1A] hover:bg-[#333333] text-white'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#1A1A1A] text-xs">{take.originalName}</span>
                        {take.isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f1faf4] text-[#0f8b37] border border-[#b8e4c6]">
                            Aprovado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#737373] mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#3478F6]" /> {take.duration || '--'}
                        </span>
                        {take.fileSize && (
                          <span>{(take.fileSize / 1024).toFixed(0)} KB</span>
                        )}
                        <span>{new Date(take.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Take */}
                  <div className="flex items-center gap-2 self-stretch sm:self-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0f0f0]">
                    {/* Approve Toggle */}
                    <button
                      onClick={() => toggleApprove(take)}
                      className={`flex-1 sm:flex-none justify-center px-3.5 py-2 sm:py-1.5 min-h-[38px] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border shadow-xs ${
                        take.isApproved
                          ? 'bg-[#12A642] text-white border-[#12A642]'
                          : 'bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] border-[#D4D4D4]'
                      }`}
                      title={take.isApproved ? 'Desmarcar aprovação' : 'Aprovar este take para edição'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{take.isApproved ? 'Aprovado' : 'Aprovar'}</span>
                    </button>

                    {/* Download */}
                    <a
                      href={take.url}
                      download={`${take.originalName.replace(/\s+/g, '_')}.webm`}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors border border-[#E5E5E5]"
                      title="Baixar arquivo de áudio"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteTake(take.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-[#737373] hover:text-[#F33D3D] hover:bg-[#fef3f3] transition-colors"
                      title="Excluir take"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
