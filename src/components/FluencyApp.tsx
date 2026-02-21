import { useState, useCallback, useRef } from "react";
import SentenceDisplay from "./SentenceDisplay";
import ResultsScreen from "./ResultsScreen";

export type Difficulty = "easy" | "medium" | "hard" | "extreme";

const SENTENCES: Record<Difficulty, string[]> = {
  easy: [
    "The sun is shining today.",
    "I like to read books.",
    "She has a big smile.",
    "We went to the park.",
    "He drinks water every day.",
    "The cat sat on the mat.",
    "I can see the moon tonight.",
    "They play soccer after school.",
    "My dog loves to run fast.",
    "She sings a beautiful song.",
    "The sky is blue and clear.",
    "He walks to work every morning.",
    "I enjoy eating fresh fruit.",
    "Birds fly high in the sky.",
    "We had fun at the beach.",
    "Practice makes perfect.",
    "Knowledge is power.",
    "Better late than never.",
    "Actions speak louder than words.",
    "All that glitters is not gold.",
  ],
  medium: [
    "The quick brown fox jumps over the lazy dog.",
    "She sells seashells by the seashore.",
    "The early bird catches the worm.",
    "A journey of a thousand miles begins with a single step.",
    "Every cloud has a silver lining.",
    "To be or not to be, that is the question.",
    "The pen is mightier than the sword.",
    "Beauty is in the eye of the beholder.",
    "Time flies when you are having fun.",
    "You cannot judge a book by its cover.",
    "When in Rome, do as the Romans do.",
    "The grass is always greener on the other side.",
    "Two wrongs do not make a right.",
    "An apple a day keeps the doctor away.",
    "Honesty is the best policy in every situation.",
    "A picture is worth a thousand words.",
    "Curiosity killed the cat but satisfaction brought it back.",
    "The best things in life are free and simple.",
    "Fortune favors the bold and the brave.",
    "Laughter is the best medicine for the soul.",
    "Rome was not built in a single day.",
    "Where there is a will there is a way.",
    "Do not count your chickens before they hatch.",
    "People who live in glass houses should not throw stones.",
    "The squeaky wheel gets the grease eventually.",
  ],
  hard: [
    "She decided to reorganize her entire schedule for maximum productivity.",
    "The unprecedented circumstances required an extraordinary response from everyone.",
    "His entrepreneurial spirit led him to establish a successful enterprise.",
    "The pharmaceutical company developed a revolutionary treatment for the disease.",
    "Environmental sustainability requires collective responsibility and individual commitment.",
    "The distinguished professor delivered a comprehensive lecture on quantum mechanics.",
    "Technological advancements have fundamentally transformed contemporary communication methods.",
    "The archaeological expedition uncovered remarkable artifacts from an ancient civilization.",
    "International cooperation is essential for addressing complex geopolitical challenges effectively.",
    "The sophisticated algorithm processes millions of data points simultaneously.",
    "Her meticulous attention to detail distinguished her from the competition.",
    "The constitutional amendment underwent rigorous parliamentary debate before ratification.",
    "Psychological resilience enables individuals to navigate adversity with determination.",
    "The interdisciplinary research initiative yielded groundbreaking scientific discoveries.",
    "Artificial intelligence continues to revolutionize industries across the globe.",
    "The philanthropic organization distributed resources to underprivileged communities worldwide.",
    "Electromagnetic radiation encompasses a broad spectrum of wavelengths and frequencies.",
    "The bureaucratic procedures significantly delayed the implementation of the proposal.",
    "Neuroplasticity demonstrates the remarkable adaptability of the human brain.",
    "The comprehensive investigation revealed several previously undiscovered inconsistencies.",
  ],
  extreme: [
    "Notwithstanding the considerable opposition, the legislature passed the controversial bill unanimously.",
    "The juxtaposition of traditional methodologies with innovative approaches yielded unprecedented results.",
    "Disproportionate representation in governmental institutions undermines the principles of democratic governance.",
    "The meteorological phenomenon was characterized by extraordinarily unpredictable atmospheric fluctuations.",
    "Socioeconomic disparities perpetuate systemic inequalities that disproportionately affect marginalized populations.",
    "The multidisciplinary symposium facilitated constructive dialogue among distinguished international scholars.",
    "Unprecedented technological proliferation has irrevocably altered the contemporary socioeconomic landscape.",
    "The conscientious entrepreneur meticulously orchestrated a comprehensive restructuring of the organization.",
    "Epistemological inquiries fundamentally challenge our preconceived notions about the nature of knowledge.",
    "The uncharacteristically temperate weather precipitated an extraordinarily abundant agricultural harvest.",
    "Cardiovascular rehabilitation programs have demonstrated statistically significant improvements in patient outcomes.",
    "The geopolitical ramifications of the unprecedented diplomatic negotiations reverberated across continents.",
    "Biotechnological innovations in pharmaceutical research have accelerated therapeutic development exponentially.",
    "The idiosyncratic characteristics of the experimental compound necessitated further rigorous investigation.",
    "Anthropological studies illuminate the intricate relationship between cultural identity and societal evolution.",
    "Disenfranchised communities increasingly leverage grassroots mobilization to advocate for institutional reform.",
    "The unequivocal consensus among climatologists underscores the urgency of environmental stewardship.",
    "Quantum entanglement challenges our fundamental understanding of locality and determinism in physics.",
    "The jurisprudential analysis elucidated the constitutional implications of the landmark judicial decision.",
    "Sociolinguistic research reveals how dialectical variations reflect historical migration patterns and cultural exchange.",
  ],
};

const getRandomSentence = (difficulty: Difficulty) => {
  const pool = SENTENCES[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
};

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
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [sentence, setSentence] = useState(() => getRandomSentence("medium"));
  const [phase, setPhase] = useState<Phase>("idle");
  const [liveText, setLiveText] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const fullTranscriptRef = useRef("");

  const changeDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setSentence(getRandomSentence(d));
    setPhase("idle");
    setLiveText("");
    setResult(null);
  }, []);

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
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    fullTranscriptRef.current = "";
    setLiveText("");
    setPhase("listening");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t + " ";
        } else {
          interimText += t;
        }
      }
      const combined = (finalText + interimText).trim();
      fullTranscriptRef.current = combined;
      setLiveText(combined);
    };

    recognition.onend = () => {
      const transcript = fullTranscriptRef.current.trim();
      if (transcript) {
        const res = compareSentences(sentence, transcript);
        setResult(res);
        setPhase("results");
      } else {
        setPhase("idle");
      }
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
    setSentence(getRandomSentence(difficulty));
    setPhase("idle");
    setLiveText("");
    setResult(null);
  }, [difficulty]);

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
      difficulty={difficulty}
      onDifficultyChange={changeDifficulty}
      onStart={startListening}
      onStop={stopListening}
      onNext={nextSentence}
    />
  );
}
