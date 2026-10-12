import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Headphones, 
  UserCheck,
  FastForward
} from 'lucide-react';

export const VoiceNotePlayer = ({ 
  audioSrc, 
  audioUrl,
  title,
  label,
  subtitle = 'প্রেসক্রিপশন অনুযায়ী মুখে বলে দেওয়া নির্দেশনা',
  spokenText = '',
  pharmacistNotes = '',
  durationText = '',
  durationLabel = '',
  pharmacistName = 'বেলী ফার্মেসি রেজিস্টার্ড ফার্মাসিস্ট',
  isCompact = false
}) => {
  const resolvedAudio = audioSrc || audioUrl;
  const resolvedTitle = title || label || 'ফার্মাসিস্টের অডিও সেবনবিধি';
  const resolvedSpoken = spokenText || pharmacistNotes || '';
  const resolvedDuration = durationText || durationLabel || '';

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [resolvedAudio]);

  const togglePlay = () => {
    // If we have a regular audio file / data URL
    if (resolvedAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn('Audio play error, falling back to speech:', err);
          speakFallback();
        });
      }
      return;
    }

    // Fallback if no audioSrc but spokenText exists
    if (resolvedSpoken) {
      speakFallback();
    }
  };

  const speakFallback = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeechPlaying) {
      window.speechSynthesis.cancel();
      setIsSpeechPlaying(false);
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(resolvedSpoken);
    utterance.lang = 'bn-BD';
    utterance.rate = playbackRate;
    utterance.onstart = () => {
      setIsSpeechPlaying(true);
      setIsPlaying(true);
    };
    utterance.onend = () => {
      setIsSpeechPlaying(false);
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsSpeechPlaying(false);
      setIsPlaying(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else if (spokenText) {
      window.speechSynthesis?.cancel();
      speakFallback();
    }
  };

  const toggleRate = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`bg-gradient-to-br from-[#0b2265] via-[#123184] to-[#02975E] text-white ${isCompact ? 'p-3 rounded-xl space-y-2' : 'p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-3.5'} shadow-xl border border-emerald-400/30 relative overflow-hidden animate-in fade-in`}>
      {/* Background Decorative Waves */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -left-8 -top-8 w-36 h-36 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>

      {resolvedAudio && <audio ref={audioRef} src={resolvedAudio} preload="metadata" />}

      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`${isCompact ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-2xl'} bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner`}>
            <Headphones className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-300`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className={`font-extrabold ${isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-white tracking-tight truncate`}>
                {resolvedTitle}
              </h4>
              <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>ভয়েস নোট 🎙️</span>
              </span>
            </div>
            {!isCompact && (
              <p className="text-[11px] text-emerald-100/90 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Pharmacist Badge */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 shrink-0">
          <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>{pharmacistName}</span>
        </div>
      </div>

      {/* Spoken Text Quote Card if provided */}
      {resolvedSpoken && (
        <div className="bg-black/25 backdrop-blur-xs border border-white/15 p-2 rounded-xl text-xs text-emerald-50 leading-relaxed italic relative z-10">
          <span className="font-semibold text-emerald-300 not-italic block mb-0.5 text-[11px]">💬 ফার্মাসিস্টের পরামর্শ:</span>
          "{resolvedSpoken}"
        </div>
      )}

      {/* Audio Controller Bar */}
      <div className={`bg-white/10 backdrop-blur-md rounded-2xl ${isCompact ? 'p-2' : 'p-3'} border border-white/15 space-y-2 relative z-10`}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className={`${isCompact ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl'} flex items-center justify-center text-slate-900 transition-all cursor-pointer shadow-lg active:scale-95 shrink-0 ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 ring-4 ring-amber-400/30'
                : 'bg-emerald-400 hover:bg-emerald-300 ring-4 ring-emerald-400/30 hover:scale-105'
            }`}
            title={isPlaying ? 'বিরতি দিন (Pause)' : 'প্লে করুন (Play)'}
          >
            {isPlaying ? (
              <Pause className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} fill-slate-900`} />
            ) : (
              <Play className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} fill-slate-900 ml-0.5`} />
            )}
          </button>

          {/* Equalizer Wave / Timeline Progress */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-200 font-bold">
              <span>{formatTime(currentTime)}</span>
              {/* Dynamic Animated Soundwave indicator */}
              <div className="flex items-center gap-0.5 h-3">
                {[40, 75, 100, 60, 90, 45, 80, 50].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: isPlaying ? `${h}%` : '20%' }}
                    className={`w-0.5 rounded-full bg-emerald-300 transition-all duration-150 ${
                      isPlaying ? 'animate-pulse' : 'opacity-40'
                    }`}
                  />
                ))}
              </div>
              <span>{duration > 0 ? formatTime(duration) : (resolvedDuration || '0:30')}</span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max={duration || 30}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300"
            />
          </div>

          {/* Right Action Tools: Replay, Speed, Mute */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleReplay}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="শুরু থেকে শুনুন (Replay)"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={toggleRate}
              className="px-1.5 sm:px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer"
              title="প্লেব্যাক স্পিড পরিবর্তন করুন"
            >
              {playbackRate}x
            </button>

            {resolvedAudio && (
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer hidden sm:block"
                title={isMuted ? 'আনমিউট' : 'মিউট'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
