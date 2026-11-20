import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Point = {
  x: number;
  y: number;
};

type BrushingAudio = {
  context: AudioContext;
  source: AudioBufferSourceNode;
  gain: GainNode;
};

const ASSETS = `${import.meta.env.BASE_URL}assets`;
const TOOTHBRUSH = `${ASSETS}/game/toothbrush.png`;
const BUBBLES = `${ASSETS}/game/bubbles.png`;
const CHARACTER = `${ASSETS}/35b6f.svg`;
const BODY_LINE_VERTICAL = `${ASSETS}/3b235.svg`;
const BODY_LINE_HORIZONTAL = `${ASSETS}/72128.svg`;
const OPENING_TURTLE_SHADOW = `${ASSETS}/646ce.svg`;
const OPENING_TURTLE = `${ASSETS}/a1809.svg`;
const OPENING_BRUSH_SHADOW = `${ASSETS}/d119e.svg`;
const OPENING_BRUSH = `${ASSETS}/243f1.png`;
const OPENING_BUBBLES = `${ASSETS}/81aa1.svg`;
const TEETH_STATES = [
  `${ASSETS}/6b0e1.svg`,
  `${ASSETS}/1bc0b.svg`,
  `${ASSETS}/2dd09.svg`,
  `${ASSETS}/6fd38.svg`,
];

function playFoamBubble(context: AudioContext) {
  const now = context.currentTime;
  const duration = 0.1 + Math.random() * 0.04;
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(620 + Math.random() * 180, now);
  oscillator.frequency.exponentialRampToValueAtTime(280 + Math.random() * 100, now + duration);
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.03, now + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.01);
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const gameRef = useRef<HTMLElement>(null);
  const teethRef = useRef<HTMLDivElement>(null);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const brushingAudioRef = useRef<BrushingAudio | null>(null);
  const draggingRef = useRef(false);
  const lastBrushPoint = useRef<Point | null>(null);
  const [brushPosition, setBrushPosition] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBrushing, setIsBrushing] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const isFullyClean = cleaningProgress >= 0.9;

  useEffect(() => {
    return () => {
      window.clearTimeout(bubbleTimer.current);
      const audio = brushingAudioRef.current;
      if (audio) {
        audio.source.stop();
        void audio.context.close().catch((error) => {
          console.error("Could not close the brushing sound.", error);
        });
      }
    };
  }, []);

  useEffect(() => {
    let audio = brushingAudioRef.current;
    if (!isBrushing) {
      if (audio) {
        const now = audio.context.currentTime;
        audio.gain.gain.cancelScheduledValues(now);
        audio.gain.gain.setTargetAtTime(0, now, 0.025);
      }
      return;
    }

    if (!audio) {
      const context = new AudioContext();
      const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index += 1) {
        samples[index] = (Math.random() * 2 - 1) * 0.5;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const highPass = context.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 300;

      const lowPass = context.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = 1800;

      const gain = context.createGain();
      gain.gain.value = 0;
      source.connect(highPass);
      highPass.connect(lowPass);
      lowPass.connect(gain);
      gain.connect(context.destination);
      source.start();

      audio = { context, source, gain };
      brushingAudioRef.current = audio;
    }

    let cancelled = false;
    let bubbleInterval: number | undefined;

    const startSound = () => {
      if (cancelled) return;
      const now = audio.context.currentTime;
      audio.gain.gain.cancelScheduledValues(now);
      audio.gain.gain.setTargetAtTime(0.024, now, 0.025);
      playFoamBubble(audio.context);
      bubbleInterval = window.setInterval(() => playFoamBubble(audio.context), 260);
    };

    if (audio.context.state === "suspended") {
      void audio.context.resume().then(startSound).catch((error) => {
        console.error("Could not resume the brushing sound.", error);
      });
    } else {
      startSound();
    }

    return () => {
      cancelled = true;
      window.clearInterval(bubbleInterval);
      const currentAudio = brushingAudioRef.current;
      if (currentAudio) {
        const now = currentAudio.context.currentTime;
        currentAudio.gain.gain.cancelScheduledValues(now);
        currentAudio.gain.gain.setTargetAtTime(0, now, 0.025);
      }
    };
  }, [isBrushing]);

  useEffect(() => {
    if (!isFullyClean) return;

    const resetTimer = window.setTimeout(() => setCleaningProgress(0), 2500);
    return () => window.clearTimeout(resetTimer);
  }, [isFullyClean]);

  const moveBrush = (point: Point, showBubbles: boolean) => {
    setBrushPosition(point);
    const previousPoint = lastBrushPoint.current;
    lastBrushPoint.current = point;

    if (!showBubbles) return;

    const teeth = teethRef.current?.getBoundingClientRect();
    const isInsideTeeth = (candidate: Point) =>
      teeth !== undefined &&
      candidate.x >= teeth.left &&
      candidate.x <= teeth.right &&
      candidate.y >= teeth.top &&
      candidate.y <= teeth.bottom;
    const isOverTeeth = isInsideTeeth(point);

    setIsBrushing(isOverTeeth);
    window.clearTimeout(bubbleTimer.current);

    if (isOverTeeth) {
      if (previousPoint && isInsideTeeth(previousPoint) && teeth) {
        const distance = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
        const usefulDistance = Math.min(distance, teeth.width * 0.25);
        setCleaningProgress((progress) =>
          Math.min(1, progress + usefulDistance / (teeth.width * 8)),
        );
      }
      bubbleTimer.current = window.setTimeout(() => setIsBrushing(false), 150);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault();
    gameRef.current?.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    moveBrush({ x: event.clientX, y: event.clientY }, false);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return;
    event.preventDefault();
    moveBrush({ x: event.clientX, y: event.clientY }, true);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (gameRef.current?.hasPointerCapture(event.pointerId)) {
      gameRef.current.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = false;
    lastBrushPoint.current = null;
    setBrushPosition(null);
    setIsDragging(false);
    setIsBrushing(false);
    window.clearTimeout(bubbleTimer.current);
  };

  const teethState = isFullyClean
    ? 3
    : cleaningProgress >= 0.58
      ? 2
      : cleaningProgress >= 0.28
        ? 1
        : 0;

  if (!hasStarted) {
    return (
      <main className="opening-screen">
        <h1 className="opening-title">
          MORNING
          <br />
          CLEANSE
        </h1>

        <div className="opening-turtle" aria-hidden="true">
          <img className="opening-turtle-shadow" src={OPENING_TURTLE_SHADOW} alt="" />
          <img className="opening-turtle-color" src={OPENING_TURTLE} alt="" />
        </div>

        <div className="opening-brush" aria-hidden="true">
          <div className="opening-brush-art">
            <img className="opening-brush-shadow" src={OPENING_BRUSH_SHADOW} alt="" />
            <img className="opening-brush-color" src={OPENING_BRUSH} alt="" />
          </div>
        </div>
        <img className="opening-bubbles" src={OPENING_BUBBLES} alt="" aria-hidden="true" />

        <button className="start-button" type="button" onClick={() => setHasStarted(true)}>
          START
        </button>
      </main>
    );
  }

  return (
    <main
      ref={gameRef}
      className="game"
      aria-label="Toothbrushing game. Tap anywhere, then drag the toothbrush over the teeth."
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="character-stage" aria-hidden="true">
        <img className="character" src={CHARACTER} alt="" draggable={false} />
        <img className="teeth-state" src={TEETH_STATES[teethState]} alt="" draggable={false} />
        <img className="body-line vertical" src={BODY_LINE_VERTICAL} alt="" draggable={false} />
        <img className="body-line horizontal" src={BODY_LINE_HORIZONTAL} alt="" draggable={false} />
        <div ref={teethRef} className="teeth-target" />
      </div>

      {brushPosition && (
        <div
          className={`brush ${isDragging ? "is-dragging" : ""}`}
          style={{ transform: `translate3d(${brushPosition.x}px, ${brushPosition.y}px, 0)` }}
          aria-hidden="true"
        >
          <div className={`foam ${isBrushing ? "is-active" : ""}`}>
            <img src={BUBBLES} alt="" draggable={false} />
            <i className="bubble bubble-one" />
            <i className="bubble bubble-two" />
            <i className="bubble bubble-three" />
          </div>
          <img className="toothbrush" src={TOOTHBRUSH} alt="" draggable={false} />
        </div>
      )}

      {!brushPosition && (
        <div className="tap-hint" aria-hidden="true">
          <span className="tap-ring" />
          <span>Tap to start brushing</span>
        </div>
      )}
    </main>
  );
}
