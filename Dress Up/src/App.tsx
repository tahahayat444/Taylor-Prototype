import { useState } from "react";

type Slot = "top" | "bottom" | "outfit" | "head" | "shoes" | "accessory";

type ClothingItem = {
  id: string;
  label: string;
  slot: Slot;
  asset: string;
  className: string;
  wornClassName: string;
};

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/frame32/${name}.svg`;
const alignmentAsset = (name: string) => `${import.meta.env.BASE_URL}assets/alignment/${name}.svg`;
const group89Asset = (name: string) => `${import.meta.env.BASE_URL}assets/group89/${name}.svg`;
const openingAsset = (name: string) => `${import.meta.env.BASE_URL}assets/opening/${name}.svg`;

function OpeningScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="opening-stage" aria-label="Dress Up opening screen">
      <h1 className="opening-title">DRESS UP</h1>

      <div className="opening-turtle-motion" aria-hidden="true">
        <span className="opening-turtle-shadow">
          <img src={openingAsset("0e828")} alt="" draggable={false} />
        </span>
        <span className="opening-turtle">
          <img src={openingAsset("a1809")} alt="" draggable={false} />
        </span>
      </div>

      <div className="opening-shirt-motion" aria-hidden="true">
        <span className="opening-shirt-card">
          <img src={openingAsset("63bfd")} alt="" draggable={false} />
        </span>
        <span className="opening-shirt">
          <img src={openingAsset("6e035")} alt="" draggable={false} />
        </span>
      </div>

      <button type="button" className="start-button" onClick={onStart}>
        START
      </button>
    </section>
  );
}

function SweaterArt() {
  return (
    <span className="sweater-art">
      <img className="sweater-body" src={alignmentAsset("ca9c8")} alt="" draggable={false} />
      <span className="sweater-collar">
        <img src={alignmentAsset("a9b1e")} alt="" draggable={false} />
      </span>
      <span className="sweater-cuff sweater-cuff-left">
        <img src={alignmentAsset("77dcb")} alt="" draggable={false} />
      </span>
      <span className="sweater-cuff sweater-cuff-right">
        <img src={alignmentAsset("7c8e7")} alt="" draggable={false} />
      </span>
    </span>
  );
}

const clothing: ClothingItem[] = [
  {
    id: "blue-shirt",
    label: "Blue shirt",
    slot: "top",
    asset: asset("56251"),
    className: "item-blue-shirt",
    wornClassName: "worn-blue-shirt",
  },
  {
    id: "purple-sweater",
    label: "Purple sweater",
    slot: "top",
    asset: alignmentAsset("ca9c8"),
    className: "item-purple-sweater",
    wornClassName: "worn-purple-sweater",
  },
  {
    id: "pants",
    label: "Blue pants",
    slot: "bottom",
    asset: asset("a2ae9"),
    className: "item-pants",
    wornClassName: "worn-pants",
  },
  {
    id: "shorts",
    label: "Yellow shorts",
    slot: "bottom",
    asset: asset("1654e"),
    className: "item-shorts",
    wornClassName: "worn-shorts",
  },
  {
    id: "skirt",
    label: "Red skirt",
    slot: "bottom",
    asset: asset("c2c71"),
    className: "item-skirt",
    wornClassName: "worn-skirt",
  },
  {
    id: "dress",
    label: "Pink dress",
    slot: "outfit",
    asset: asset("b7d85"),
    className: "item-dress",
    wornClassName: "worn-dress",
  },
  {
    id: "beanie",
    label: "Red beanie",
    slot: "head",
    asset: asset("a982d"),
    className: "item-beanie",
    wornClassName: "worn-beanie",
  },
  {
    id: "top-hat",
    label: "Black top hat",
    slot: "head",
    asset: asset("15344"),
    className: "item-top-hat",
    wornClassName: "worn-top-hat",
  },
  {
    id: "socks",
    label: "Red and grey socks",
    slot: "shoes",
    asset: asset("333c0"),
    className: "item-socks",
    wornClassName: "worn-socks",
  },
  {
    id: "black-shoes",
    label: "Black shoes",
    slot: "shoes",
    asset: asset("e448b"),
    className: "item-black-shoes",
    wornClassName: "worn-black-shoes",
  },
  {
    id: "glasses",
    label: "Black sunglasses",
    slot: "accessory",
    asset: asset("091fe"),
    className: "item-glasses",
    wornClassName: "worn-glasses",
  },
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<Partial<Record<Slot, string>>>({});

  const toggleItem = (item: ClothingItem) => {
    setSelected((current) => {
      if (current[item.slot] === item.id) {
        const next = { ...current };
        delete next[item.slot];
        return next;
      }

      const next = { ...current, [item.slot]: item.id };

      if (item.slot === "outfit") {
        delete next.top;
        delete next.bottom;
      } else if (item.slot === "top" || item.slot === "bottom") {
        delete next.outfit;
      }

      return next;
    });
  };

  const wornItems = clothing.filter((item) => selected[item.slot] === item.id);
  const legItems = wornItems.filter((item) => item.slot === "bottom");
  const frontItems = wornItems.filter((item) => item.slot !== "bottom");

  const renderWornItem = (item: ClothingItem) => {
    if (item.id === "socks") {
      return (
        <button
          key={item.id}
          type="button"
          className={`worn-item worn-item-button ${item.wornClassName}`}
          onClick={() => toggleItem(item)}
          aria-label={`Remove ${item.label}`}
        >
          <img src={group89Asset("6371d")} alt="" />
          <img src={group89Asset("6592e")} alt="" />
        </button>
      );
    }

    if (item.id === "purple-sweater") {
      return (
        <button
          key={item.id}
          type="button"
          className={`worn-item worn-item-button ${item.wornClassName}`}
          onClick={() => toggleItem(item)}
          aria-label={`Remove ${item.label}`}
        >
          <SweaterArt />
        </button>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        className={`worn-item worn-item-button ${item.wornClassName}`}
        onClick={() => toggleItem(item)}
        aria-label={`Remove ${item.label}`}
      >
        <img src={item.asset} alt="" draggable={false} />
      </button>
    );
  };

  if (!started) {
    return (
      <main className="game-shell">
        <OpeningScreen onStart={() => setStarted(true)} />
      </main>
    );
  }

  return (
    <main className="game-shell">
      <section className="game-stage" aria-label="Tap an item to dress the character">
        <div className="striped-wall" />
        <div className="floor" />

        <div className="shelf" />
        <div className="box box-coral" />
        <div className="box box-purple" />
        <div className="box box-blue" />
        <div className="clothes-rail" />

        <div className="wardrobe-panel" />

        <div className="character" aria-live="polite">
          <img src={asset("cda10")} alt="A green turtle character" draggable={false} />
        </div>

        <div className="leg-items">
          {legItems.map(renderWornItem)}
        </div>

        <div className="shell-foreground" aria-hidden="true">
          <img src={asset("cda10")} alt="" draggable={false} />
        </div>

        <div className="worn-items">
          {frontItems.map(renderWornItem)}
        </div>

        <div className="clothing-picker">
          {clothing.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`clothing-item ${item.className}`}
              aria-label={`${selected[item.slot] === item.id ? "Remove" : "Put on"} ${item.label}`}
              aria-pressed={selected[item.slot] === item.id}
              onClick={() => toggleItem(item)}
            >
              {item.id === "purple-sweater" ? (
                <SweaterArt />
              ) : item.id === "socks" ? (
                <span className="sock-pair">
                  <img src={group89Asset("6371d")} alt="" draggable={false} />
                  <img src={group89Asset("6592e")} alt="" draggable={false} />
                </span>
              ) : (
                <img src={item.asset} alt="" draggable={false} />
              )}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
