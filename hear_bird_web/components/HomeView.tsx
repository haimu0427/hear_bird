import React, { useEffect, useRef, useState } from 'react';
import { Visualizer } from './Visualizer';

interface HomeViewProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ onFileSelect, isProcessing }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    if (isProcessing || isRecording) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      alert('Your browser does not support audio recording.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener('stop', () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: mimeType });
        chunksRef.current = [];
        stopStream();
        onFileSelect(file);
      });

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
      alert('Unable to access your microphone. Please check permissions.');
      stopStream();
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return;
    recorderRef.current.stop();
    recorderRef.current = null;
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  };

  const handleUploadClick = () => {
    if (isProcessing || isRecording) return;
    uploadInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
      e.target.value = '';
    }
  };

  const statusLabel = isProcessing
    ? 'Analyzing Audio...'
    : isRecording
      ? 'Recording... Tap to stop'
      : 'Ready to Listen';

  const statusDot = isProcessing
    ? 'bg-yellow-400'
    : isRecording
      ? 'bg-red-400'
      : 'bg-primary';

  const buttonShadow = isRecording
    ? 'shadow-[0_0_40px_-10px_rgba(248,113,113,0.65)]'
    : 'shadow-[0_0_40px_-10px_rgba(19,236,91,0.5)]';

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-surface-dark text-white">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-[65%] z-0">
        <div 
          className="w-full h-full bg-cover bg-center transition-opacity duration-700"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop')",
            filter: 'brightness(0.8)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-dark/30 to-surface-dark"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 pt-12">
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">grid_view</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase mb-1">Wen Ti Niao</span>
          <div className="flex items-center gap-1 text-white">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span className="text-sm font-semibold">Morning Forest</span>
          </div>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-end pb-20 px-6 w-full max-w-md mx-auto">
        
        {/* Status Badge */}
        <div className="mb-10 px-5 py-2 bg-surface-dark/50 backdrop-blur-md rounded-full border border-white/5 shadow-lg">
          <span className="text-sm font-medium text-slate-200 tracking-wide flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusDot} animate-pulse`}></span>
            {statusLabel}
          </span>
        </div>

        {/* Audio Visualizer */}
        <Visualizer isListening={isRecording || isProcessing} />

        {/* Title */}
        <h2 className="text-3xl font-light text-center text-white mb-10 leading-tight font-display">
          Recording the sounds<br/>
          <span className="font-bold">of nature...</span>
        </h2>

        {/* Mic Button */}
        <div className="relative">
          <input
            type="file"
            ref={uploadInputRef}
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
          />
          <button
            onClick={handleMicClick}
            disabled={isProcessing}
            className="group relative flex items-center justify-center outline-none touch-none"
          >
            {/* Glow Rings */}
            <div className={`absolute inset-0 rounded-full ${isRecording ? 'bg-red-500/20' : 'bg-primary/20'} blur-xl scale-110 transition-transform duration-700 ${isProcessing ? 'animate-pulse' : 'group-hover:scale-125'}`}></div>
            <div className={`absolute inset-0 rounded-full ${isRecording ? 'bg-red-500/20' : 'bg-primary/20'} scale-100 transition-transform duration-500 ${isProcessing ? 'animate-ping' : 'group-hover:scale-110'}`}></div>

            {/* Main Button */}
            <div className={`relative h-24 w-24 rounded-full ${isRecording ? 'bg-red-400' : 'bg-primary'} flex items-center justify-center ${buttonShadow} group-active:scale-95 transition-all`}>
              {isProcessing ? (
                <span className="material-symbols-outlined text-surface-dark text-[40px] animate-spin">progress_activity</span>
              ) : isRecording ? (
                <span className="material-symbols-outlined text-surface-dark text-[40px]">stop</span>
              ) : (
                <span className="material-symbols-outlined text-surface-dark text-[40px] font-bold">mic</span>
              )}
            </div>
          </button>

          <button
            onClick={handleUploadClick}
            disabled={isProcessing || isRecording}
            className="absolute -right-6 bottom-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-dark/70 text-white/80 shadow-lg backdrop-blur-md transition hover:text-white active:scale-95 disabled:opacity-40"
            aria-label="Upload audio"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
          </button>
        </div>
      </div>
    </div>
  );
};
