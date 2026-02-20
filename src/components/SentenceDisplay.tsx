import { Mic, MicOff, RefreshCw } from "lucide-react";

interface Props {
  sentence: string;
  phase: "idle" | "listening" | "results";
  liveText: string;
  onStart: () => void;
  onStop: () => void;
  onNext: () => void;
}

export default function SentenceDisplay({
  sentence,
  phase,
  liveText,
  onStart,
  onStop,
  onNext,
}: Props) {
  const isListening = phase === "listening";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-16 flex items-center gap-3">
        <Mic className="h-5 w-5 text-primary" />
        <span className="font-mono-app text-sm font-medium tracking-widest text-dim uppercase">
          fluency
        </span>
      </div>

      {/* Main sentence */}
      <div className="mb-10 w-full max-w-2xl text-center">
        <p className="font-mono-app text-2xl leading-relaxed tracking-wide text-foreground/90 select-none">
          {sentence}
        </p>
      </div>

      {/* Live transcript area */}
      <div className="mb-12 h-16 w-full max-w-2xl flex items-center justify-center">
        {isListening ? (
          <div className="animate-fade-in w-full text-center">
            <p className="font-mono-app text-lg text-primary/80 leading-relaxed tracking-wide min-h-[1.5rem]">
              {liveText || (
                <span className="text-dim italic text-base">listening…</span>
              )}
            </p>
          </div>
        ) : (
          <p className="font-mono-app text-sm text-dim italic">
            press start and read the sentence aloud
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {isListening ? (
          <button
            onClick={onStop}
            className="flex items-center gap-2.5 rounded-md bg-primary px-7 py-3 font-mono-app text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/85 animate-pulse-glow"
          >
            <MicOff className="h-4 w-4" />
            Stop
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center gap-2.5 rounded-md bg-primary px-7 py-3 font-mono-app text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/85"
          >
            <Mic className="h-4 w-4" />
            Start Speaking
          </button>
        )}

        {!isListening && (
          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-md border border-border px-5 py-3 font-mono-app text-sm text-dim transition-all duration-200 hover:text-foreground hover:border-foreground/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New Sentence
          </button>
        )}
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="mt-8 flex items-center gap-2 animate-fade-in">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="font-mono-app text-xs text-dim tracking-widest uppercase">
            recording
          </span>
        </div>
      )}
    </div>
  );
}
