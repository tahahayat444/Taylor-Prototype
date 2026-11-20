import { useState } from "react";

type Item = "sock" | "helmet" | "apple";

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}.svg`;

const items: Array<{ id: Item; label: string }> = [
  { id: "sock", label: "sock" },
  { id: "helmet", label: "helmet" },
  { id: "apple", label: "apple" },
];

const equippedArt: Record<Item, string> = {
  apple: asset("apple-equipped-base"),
  helmet: asset("f3e00"),
  sock: asset("d17f5"),
};

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="start-screen" aria-labelledby="game-title">
      <h1 id="game-title">
        <span>SAFETY</span>
        <span>CHECK</span>
      </h1>

      <div className="start-character start-taylor" aria-hidden="true">
        <img src={asset("8e40a")} alt="" />
        <img src={asset("42db8")} alt="" />
      </div>

      <div className="start-character start-helmet" aria-hidden="true">
        <img src={asset("c32ec")} alt="" />
        <img src={asset("6d4b3")} alt="" />
      </div>

      <button className="start-button" type="button" onClick={onStart}>
        START
      </button>
    </main>
  );
}

function Choice({ item, onSelect }: { item: Item; onSelect: (item: Item) => void }) {
  if (item === "sock") {
    return (
      <button
        className="choice choice-sock"
        type="button"
        aria-label="Put the sock on Taylor"
        data-click-sound="incorrect"
        onClick={() => onSelect(item)}
      >
        <img src={asset("b24ef")} alt="" />
      </button>
    );
  }

  return (
    <button
      className={`choice choice-${item}`}
      type="button"
      aria-label={`Put the ${item} on Taylor`}
      data-click-sound={item === "helmet" ? "yay" : "incorrect"}
      onClick={() => onSelect(item)}
    >
      <img src={item === "helmet" ? asset("d34f7") : asset("07960")} alt="" />
    </button>
  );
}

function GameScreen({ onRestart }: { onRestart: () => void }) {
  const [equipped, setEquipped] = useState<Item | null>(null);

  return (
    <main className="game-screen">
      <div
        className={`scene-layer scene-idle ${equipped ? "is-hidden" : ""}`}
        aria-hidden={equipped ? "true" : undefined}
      >
        <img className="idle-art" src={asset("scene-idle-no-sock")} alt="" />
        {items.map(({ id }) => (
          <Choice key={id} item={id} onSelect={setEquipped} />
        ))}
      </div>

      {items.map(({ id, label }) => (
        <div
          className={`scene-layer equipped-layer ${equipped === id ? "is-active" : ""}`}
          key={id}
          aria-hidden={equipped !== id}
        >
          <img className="equipped-art" src={equippedArt[id]} alt="" />
          {id === "apple" && <img className="equipped-apple" src={asset("acf1e")} alt="" />}
          <button
            className={`remove-item remove-${id}`}
            type="button"
            aria-label={`Take the ${label} off Taylor`}
            tabIndex={equipped === id ? 0 : -1}
            onClick={() => setEquipped(null)}
          />
        </div>
      ))}

      <button className="restart-button" type="button" onClick={onRestart}>
        RESTART
      </button>

      <p className="game-hint" aria-live="polite">
        {equipped
          ? `Tap the ${equipped} on Taylor to take it off`
          : "Tap an item to try it on Taylor"}
      </p>
    </main>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  return started ? (
    <GameScreen onRestart={() => setStarted(false)} />
  ) : (
    <StartScreen onStart={() => setStarted(true)} />
  );
}
