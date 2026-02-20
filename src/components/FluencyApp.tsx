import { useState, useCallback, useRef } from "react";
import SentenceDisplay from "./SentenceDisplay";
import ResultsScreen from "./ResultsScreen";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "She sells seashells by the seashore.",
  "How much wood would a woodchuck chuck?",
  "To be or not to be, that is the question.",
  "All that glitters is not gold.",
  "Practice makes perfect.",
  "A journey of a thousand miles begins with a single step.",
  "The early bird catches the worm.",
  "Actions speak louder than words.",
  "Knowledge is power.",
  "The pen is mightier than the sword.",
  "Beauty is in the eye of the beholder.",
  "Time flies when you are having fun.",
  "Every cloud has a silver lining.",
  "Better late than never.",
  "Two wrongs do not make a right.",
  "When in Rome, do as the Romans do.",
  "The grass is always greener on the other side.",
  "You cannot judge a book by its cover.",
  "An apple a day keeps the doctor away.",
];

type Phase = "idle" | "listening" | "results";

export interface TestResult {
  original: string;
  spoken: string;
  accuracy: number;
  correctWords: string[];
  missedWords: string[];
  extraWords: string[];
}

// Browser speech recognition types
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor;
    webkitSpeechRecognition: ISpeechRecognitionConstructor;
  }
}

const getRandomSentence = () =>
  SENTENCES[Math.floor(Math.random() * SENTENCES.length)];

const normalizeWord = (w: string) =>
  w.toLowerCase().replace(/[^a-z']/g, "");

const compareSentences = (original: string, spoken: string): TestResult => {
  const origWords = original.split(" ").map(normalizeWord).filter(Boolean);
  const spokenWords = spoken.split(" ").map(normalizeWord).filter(Boolean);

  const correctWords: string[] = [];
  const missedWords: string[] = [];
  const extraWords: string[] = [];

  const spokenCopy = [...spokenWords];

  origWords.forEach((word) => {
    const idx = spokenCopy.indexOf(word);
    if (idx !== -1) {
      correctWords.push(word);
      spokenCopy.splice(idx, 1);
    } else {
      missedWords.push(word);
    }
  });

  spokenCopy.forEach((word) => {
    if (word) extraWords.push(word);
  });

  const accuracy = origWords.length === 0
    ? 0
    : Math.round((correctWords.length / origWords.length) * 100);

  return { original, spoken, accuracy, correctWords, missedWords, extraWords };
};

export default function FluencyApp() {
  const [sentence, setSentence] = useState(getRandomSentence);
  const [phase, setPhase] = useState<Phase>("idle");
  const [liveText, setLiveText] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    setLiveText("");
    setPhase("listening");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setLiveText(final || interim);
    };

    recognition.onend = () => {
      setLiveText((current) => {
        if (current.trim()) {
          const res = compareSentences(sentence, current.trim());
          setResult(res);
          setPhase("results");
        } else {
          setPhase("idle");
        }
        return current;
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      if (event.error !== "no-speech") {
        setPhase("idle");
      }
    };

    recognition.start();
  }, [sentence]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const retry = useCallback(() => {
    setPhase("idle");
    setLiveText("");
    setResult(null);
  }, []);

  const nextSentence = useCallback(() => {
    setSentence(getRandomSentence());
    setPhase("idle");
    setLiveText("");
    setResult(null);
  }, []);

  if (phase === "results" && result) {
    return (
      <ResultsScreen
        result={result}
        onRetry={retry}
        onNext={nextSentence}
      />
    );
  }

  return (
    <SentenceDisplay
      sentence={sentence}
      phase={phase}
      liveText={liveText}
      onStart={startListening}
      onStop={stopListening}
      onNext={nextSentence}
    />
  );
}
