import { useState, type CSSProperties } from "react";

type ObjectLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
};

type SortableObject = {
  id: string;
  name: string;
  unsortedAsset: string;
  sortedAsset: string;
  unsorted: ObjectLayout;
  sorted: ObjectLayout;
};

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}.svg`;

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="start-screen" aria-labelledby="clean-up-title">
      <h1 className="opening-title" id="clean-up-title">
        CLEAN UP
      </h1>

      <div className="opening-turtle-motion" aria-hidden="true">
        <img src={asset("opening-turtle")} alt="" draggable={false} />
      </div>

      <div className="opening-pens-motion" aria-hidden="true">
        <img src={asset("opening-pens")} alt="" draggable={false} />
      </div>

      <button className="start-button" type="button" onClick={onStart}>
        START
      </button>
    </section>
  );
}

const objects: SortableObject[] = [
  {
    id: "blue-book",
    name: "blue coloring book",
    unsortedAsset: asset("775b2"),
    sortedAsset: asset("dbb13"),
    unsorted: { left: 27, top: 25, width: 5.6, height: 8.4, rotation: -8 },
    sorted: { left: 74.25, top: 55.7, width: 5.35, height: 8, rotation: -0.74 },
  },
  {
    id: "orange-book",
    name: "orange coloring book",
    unsortedAsset: asset("e89d8"),
    sortedAsset: asset("e89d8"),
    unsorted: { left: 42, top: 55, width: 5.6, height: 8.4, rotation: 7 },
    sorted: { left: 67.25, top: 54.8, width: 5.35, height: 8, rotation: 0.2 },
  },
  {
    id: "green-lego-one",
    name: "green building block",
    unsortedAsset: asset("5832c"),
    sortedAsset: asset("1f546"),
    unsorted: { left: 24, top: 48, width: 3.9, height: 7, rotation: -16 },
    sorted: { left: 66.3, top: 35.5, width: 3.4, height: 6.35, rotation: -8.73 },
  },
  {
    id: "green-lego-two",
    name: "second green building block",
    unsortedAsset: asset("5832c"),
    sortedAsset: asset("cb4e3"),
    unsorted: { left: 35, top: 67, width: 3.9, height: 7, rotation: 13 },
    sorted: { left: 69.9, top: 35.5, width: 3.4, height: 6.35, rotation: -8.73 },
  },
  {
    id: "red-lego-one",
    name: "red building block",
    unsortedAsset: asset("a2e90"),
    sortedAsset: asset("3d4ac"),
    unsorted: { left: 34.5, top: 37.8, width: 3.8, height: 7, rotation: 10 },
    sorted: { left: 73.3, top: 35.7, width: 3.4, height: 6.35, rotation: -8.73 },
  },
  {
    id: "red-lego-two",
    name: "second red building block",
    unsortedAsset: asset("a2e90"),
    sortedAsset: asset("a9d62"),
    unsorted: { left: 46.5, top: 27.5, width: 3.8, height: 7, rotation: -12 },
    sorted: { left: 76.8, top: 35.7, width: 3.4, height: 6.35, rotation: -8.73 },
  },
  {
    id: "purple-marker",
    name: "purple marker",
    unsortedAsset: asset("21eb5"),
    sortedAsset: asset("21eb5"),
    unsorted: { left: 48.5, top: 64.5, width: 4.25, height: 11.8, rotation: 18 },
    sorted: { left: 69.8, top: 42.8, width: 4.25, height: 11.8, rotation: -3.33 },
  },
  {
    id: "red-marker",
    name: "red marker",
    unsortedAsset: asset("cbe0c"),
    sortedAsset: asset("cbe0c"),
    unsorted: { left: 30.5, top: 57.5, width: 4.25, height: 11.8, rotation: -20 },
    sorted: { left: 74.1, top: 42.7, width: 4.25, height: 11.8, rotation: 0 },
  },
  {
    id: "green-marker",
    name: "green marker",
    unsortedAsset: asset("ee95c"),
    sortedAsset: asset("ee95c"),
    unsorted: { left: 40.5, top: 21.5, width: 1.75, height: 12, rotation: -6 },
    sorted: { left: 78.4, top: 43.1, width: 1.75, height: 12, rotation: -3.33 },
  },
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [sortedIds, setSortedIds] = useState<string[]>([]);
  const [phoneWiggling, setPhoneWiggling] = useState(false);

  const toggleObject = (id: string) => {
    setSortedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  };

  if (!started) {
    return (
      <main className="game-shell">
        <StartScreen onStart={() => setStarted(true)} />
      </main>
    );
  }

  return (
    <main className="game-shell">
      <section className="game-stage" aria-label="Tap the objects to tidy them into the basket">
        <img className="rug-fringe" src={asset("23d77")} alt="" />
        <div className="rug" />

        <img className="basket" src={asset("042a0")} alt="" aria-hidden="true" />

        {objects.map((object) => {
          const isSorted = sortedIds.includes(object.id);
          const layout = isSorted ? object.sorted : object.unsorted;

          return (
            <button
              key={object.id}
              type="button"
              className={`sortable-object object-${object.id} ${isSorted ? "is-sorted" : ""}`}
              style={
                {
                  "--object-left": `${layout.left}%`,
                  "--object-top": `${layout.top}%`,
                  "--object-width": `${layout.width}%`,
                  "--object-height": `${layout.height}%`,
                  "--object-rotation": `${layout.rotation}deg`,
                } as CSSProperties
              }
              onClick={() => toggleObject(object.id)}
              aria-label={`${isSorted ? "Take out" : "Put away"} ${object.name}`}
              aria-pressed={isSorted}
            >
              <img src={isSorted ? object.sortedAsset : object.unsortedAsset} alt="" />
            </button>
          );
        })}

        <button
          type="button"
          className={`phone ${phoneWiggling ? "is-wiggling" : ""}`}
          onClick={() => setPhoneWiggling(true)}
          onAnimationEnd={() => setPhoneWiggling(false)}
          aria-label="Wiggle phone"
        >
          <img src={asset("69ea2")} alt="" />
        </button>
      </section>
    </main>
  );
}
