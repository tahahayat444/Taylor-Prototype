import { useCallback, useEffect, useRef, useState } from "react";

const HOLD_DURATION = 5000;
const ASSETS = "/assets";

type GameId = "safety" | "stick" | "dress" | "clean" | "morning";

type Game = {
  id: GameId;
  label: string;
  art: React.ReactNode;
};

const games: Game[] = [
  {
    id: "safety",
    label: "SAFTEY CHECK",
    art: (
      <span className="game-art safety-art" aria-hidden="true">
        <img src={`${ASSETS}/ee4d3.svg`} alt="" />
        <img src={`${ASSETS}/27fd4.svg`} alt="" />
      </span>
    ),
  },
  {
    id: "stick",
    label: "STICK AND FIX",
    art: <img className="game-art stick-art" src={`${ASSETS}/fb8af.svg`} alt="" />,
  },
  {
    id: "dress",
    label: "Dress Up",
    art: (
      <span className="game-art dress-art" aria-hidden="true">
        <img src={`${ASSETS}/70cd4.svg`} alt="" />
        <img src={`${ASSETS}/c0dab.svg`} alt="" />
      </span>
    ),
  },
  {
    id: "clean",
    label: "CLEAN UP",
    art: (
      <span className="game-art clean-art" aria-hidden="true">
        <img src={`${ASSETS}/0ef45.svg`} alt="" />
        <img src={`${ASSETS}/177a8.svg`} alt="" />
      </span>
    ),
  },
  {
    id: "morning",
    label: "MORNING CLENSE",
    art: (
      <span className="game-art morning-art" aria-hidden="true">
        <img src={`${ASSETS}/243f1.png`} alt="" />
        <img src={`${ASSETS}/17e06.svg`} alt="" />
      </span>
    ),
  },
];

const bodyCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";

function HoldButton({
  children,
  className,
  onComplete,
  onProgressChange,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  onComplete: () => void;
  onProgressChange?: (progress: number) => void;
  label: string;
}) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef(0);
  const frame = useRef(0);
  const completed = useRef(false);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (!completed.current) {
      setProgress(0);
      onProgressChange?.(0);
    }
    setHolding(false);
  }, [onProgressChange]);

  const tick = useCallback(() => {
    const next = Math.min((performance.now() - startedAt.current) / HOLD_DURATION, 1);
    setProgress(next);
    onProgressChange?.(next);
    if (next >= 1) {
      completed.current = true;
      setHolding(false);
      onComplete();
      return;
    }
    frame.current = requestAnimationFrame(tick);
  }, [onComplete, onProgressChange]);

  const start = useCallback(() => {
    if (holding) return;
    completed.current = false;
    startedAt.current = performance.now();
    setProgress(0);
    setHolding(true);
    frame.current = requestAnimationFrame(tick);
  }, [holding, tick]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <button
      className={`hold-button ${className ?? ""} ${holding ? "is-holding" : ""}`}
      aria-label={`${label}. Press and hold for five seconds.`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        start();
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !event.repeat) start();
      }}
      onKeyUp={(event) => {
        if (event.key === "Enter" || event.key === " ") stop();
      }}
      style={{ "--hold-fill": `${progress * 100}%` } as React.CSSProperties}
    >
      {children}
      <span className="sr-only" aria-live="polite">
        {holding ? "Keep holding" : ""}
      </span>
    </button>
  );
}

function GameArt({ game }: { game: Game }) {
  return (
    <>
      {game.art}
      <span className="game-label">{game.label}</span>
    </>
  );
}

function TitleScreen({ onPlay, onParents }: { onPlay: () => void; onParents: () => void }) {
  return (
    <main className="title-screen">
      <h1>SAFE AND SOUND</h1>
      <img className="title-turtle" src={`${ASSETS}/e38b2.svg`} alt="A friendly green turtle" />
      <div className="title-actions">
        <button className="play-button" onClick={onPlay}>
          LET&apos;S PLAY!
        </button>
        <HoldButton
          className="title-parents-button"
          label="Go to For Parents"
          onComplete={onParents}
        >
          FOR PARENTS
        </HoldButton>
      </div>
    </main>
  );
}

function OpeningScreen({ onOpenParents }: { onOpenParents: () => void }) {
  return (
    <main className="opening-screen">
      <HoldButton className="menu-trigger" label="Open parent menu" onComplete={onOpenParents}>
        <img className="menu-icon-base" src={`${ASSETS}/b8b0b.svg`} alt="" />
        <img className="menu-icon-fill" src={`${ASSETS}/655bb.svg`} alt="" />
      </HoldButton>
      <section className="opening-games" aria-label="Games">
        {games.map((game) => (
          <div className={`opening-card opening-${game.id}`} key={game.id}>
            <GameArt game={game} />
          </div>
        ))}
      </section>
    </main>
  );
}

function ParentDrawer({
  open,
  onClose,
  onParents,
}: {
  open: boolean;
  onClose: () => void;
  onParents: () => void;
}) {
  const [fillProgress, setFillProgress] = useState(0);

  return (
    <div className={`drawer-layer ${open ? "open" : ""}`} aria-hidden={!open}>
      <button
        className="drawer-scrim"
        onClick={onClose}
        aria-label="Close parent menu"
        tabIndex={open ? 0 : -1}
      />
      <aside
        className={`parent-drawer ${fillProgress > 0 ? "is-filling" : ""}`}
        aria-label="Parent menu"
        style={{ "--drawer-fill": `${fillProgress * 100}%` } as React.CSSProperties}
      >
        <span className="parent-drawer-fill" aria-hidden="true" />
        <button className="drawer-close" onClick={onClose} aria-label="Close parent menu">
          <img src={`${ASSETS}/e99d8.svg`} alt="" />
        </button>
        <HoldButton
          className="parents-button"
          label="Go to For Parents"
          onComplete={onParents}
          onProgressChange={setFillProgress}
        >
          FOR PARENTS
        </HoldButton>
        <p className="hold-instruction">PRESS AND HOLD FOR 5 SECONDS</p>
      </aside>
    </div>
  );
}

function HomeButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="home-button" onClick={onClick}>
      <img src={`${ASSETS}/a389c.svg`} alt="" />
      <span>HOME</span>
    </button>
  );
}

function AboutPage({
  selected,
  onSelect,
  onBack,
  onHome,
}: {
  selected: GameId | null;
  onSelect: (id: GameId) => void;
  onBack: () => void;
  onHome: () => void;
}) {
  const selectedGame = games.find((game) => game.id === selected);

  return (
    <main className="about-page">
      <header className="about-header">
        <span>FOR PARENTS</span>
        <HomeButton onClick={onHome} />
      </header>
      <section className="about-intro">
        <h1>ABOUT THE APP</h1>
        <p>{bodyCopy}</p>
      </section>
      <section className="game-info">
        <h2>TAP ON A GAME TO LEARN HOW TO INCORPORATE ITS TEACHINGS</h2>
        {!selectedGame ? (
          <div className="about-game-grid">
            {games.map((game) => (
              <button className="about-game" key={game.id} onClick={() => onSelect(game.id)}>
                <GameArt game={game} />
              </button>
            ))}
          </div>
        ) : (
          <div className="game-detail">
            <div className="detail-left">
              <div className="detail-game">
                <GameArt game={selectedGame} />
              </div>
              <button className="back-button" onClick={onBack}>
                <img src={`${ASSETS}/cce3e.svg`} alt="" />
                <span>BACK</span>
              </button>
            </div>
            <p className="detail-copy">{bodyCopy}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState<"title" | "opening" | "about">("title");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  if (screen === "title") {
    return <TitleScreen onPlay={() => setScreen("opening")} onParents={() => setScreen("about")} />;
  }

  if (screen === "about") {
    return (
      <AboutPage
        selected={selectedGame}
        onSelect={setSelectedGame}
        onBack={() => setSelectedGame(null)}
        onHome={() => {
          setSelectedGame(null);
          setScreen("opening");
        }}
      />
    );
  }

  return (
    <>
      <OpeningScreen onOpenParents={() => setDrawerOpen(true)} />
      <ParentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onParents={() => {
          setDrawerOpen(false);
          setScreen("about");
        }}
      />
    </>
  );
}
