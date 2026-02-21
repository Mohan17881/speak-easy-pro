import { RefreshCw, ChevronRight } from "lucide-react";
import type { TestResult } from "./FluencyApp";

interface Props {
  result: TestResult;
  onRetry: () => void;
  onNext: () => void;
}

const accuracyColor = (acc: number) => {
  if (acc >= 90) return "text-correct";
  if (acc >= 70) return "text-primary";
  return "text-error";
};

export default function ResultsScreen({ result, onRetry, onNext }: Props) {
  const { accuracy, correctWords, missedWords, extraWords, spoken } = result;
  const totalWords = spoken.split(" ").filter(Boolean).length;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 animate-fade-up">
      {/* Accuracy ring / number */}
      <div className="mb-10 text-center">
        <p className="font-mono-app text-xs uppercase tracking-widest text-dim mb-3">
          accuracy
        </p>
        <p className={`font-mono-app text-8xl font-light tracking-tight ${accuracyColor(accuracy)}`}>
          {accuracy}
          <span className="text-4xl">%</span>
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-10 flex gap-10 text-center">
        <div>
          <p className="font-mono-app text-2xl font-light text-foreground">{totalWords}</p>
          <p className="font-mono-app text-xs text-dim mt-1 uppercase tracking-wider">words spoken</p>
        </div>
        <div>
          <p className="font-mono-app text-2xl font-light text-correct">{correctWords.length}</p>
          <p className="font-mono-app text-xs text-dim mt-1 uppercase tracking-wider">correct</p>
        </div>
        <div>
          <p className="font-mono-app text-2xl font-light text-error">{missedWords.length}</p>
          <p className="font-mono-app text-xs text-dim mt-1 uppercase tracking-wider">missed</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-8 w-full max-w-md border-t border-border" />

      {/* What you said */}
      <div className="mb-6 w-full max-w-md">
        <p className="font-mono-app text-xs uppercase tracking-widest text-dim mb-3">you said</p>
        <p className="font-mono-app text-sm leading-relaxed text-foreground/70">
          {spoken || <span className="italic text-dim">nothing detected</span>}
        </p>
      </div>

      {/* Missed words */}
      {missedWords.length > 0 && (
        <div className="mb-6 w-full max-w-md">
          <p className="font-mono-app text-xs uppercase tracking-widest text-dim mb-3">
            missed words
          </p>
          <div className="flex flex-wrap gap-2">
            {missedWords.map((word, i) => (
              <span
                key={i}
                className="font-mono-app rounded bg-error/10 px-2.5 py-1 text-xs text-error border border-error/20"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Extra words */}
      {extraWords.length > 0 && (
        <div className="mb-8 w-full max-w-md">
          <p className="font-mono-app text-xs uppercase tracking-widest text-dim mb-3">
            extra words
          </p>
          <div className="flex flex-wrap gap-2">
            {extraWords.map((word, i) => (
              <span
                key={i}
                className="font-mono-app rounded bg-primary/10 px-2.5 py-1 text-xs text-primary border border-primary/20"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      {missedWords.length === 0 && (
        <div className="mb-8 w-full max-w-md">
          <p className="font-mono-app text-sm text-correct text-center">
            Perfect! Every word was spoken correctly. 🎉
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-md border border-border px-6 py-2.5 font-mono-app text-sm text-dim transition-all duration-200 hover:text-foreground hover:border-foreground/30"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-mono-app text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/85"
        >
          Next Sentence
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
