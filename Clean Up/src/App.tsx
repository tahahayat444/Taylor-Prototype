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

const objects: SortableObject[] = [
  {
    id: "blue-book",
    name: "blue coloring book",
    unsortedAsset: "/assets/775b2.svg",
    sortedAsset: "/assets/dbb13.svg",
    unsorted: { left: 27, top: 25, width: 5.6, height: 8.4, rotation: -8 },
    sorted: { left: 74.25, top: 55.7, width: 5.35, height: 8, rotation: -0.74 },
  },
  {
    id: "orange-book",
    name: "orange coloring book",
    unsortedAsset: "/assets/e89d8.svg",
    sortedAsset: "/assets/e89d8.svg",
    unsorted: { left: 42, top: 55, width: 5.6, height: 8.4, rotation: 7 },
    sorted: { left: 67.25, top: 54.8, width: 5.35, height: 8, rotation: 0.2 },
  },
  {
    id: "green-lego-one",
    name: "green building block",
    unsortedAsset: "/assets/5832c.svg",
    sortedAsset: "/assets/1f546.svg",
    unsorted: { left: 24, top: 48, width: 3.9, height: 7, rotation: -16 },
    sorted: { left: 66.3, top: 35.5, width: 3.4, height: 6.35, rotation: -8.73 },
  },
  {
    id: "green-lego-two",
    name: "second green building block",
    unsortedAsset: "/assets/5832c.svg",
    sortedAsset: "/assets/cb4e3.svg",
    unsorted: { left: 35, top: 67, width: 3.9, height: 7, rotation: 13 },
    sorted: { left: 69.9, top: 35.5, width: 3.4, height: 6.35, rotation: -8.73 },
  },
  {
    id: "red-lego-one",
    name: "red building block",
    unsortedAsset: "/assets/a2e90.svg",
    sortedAsset: "/assets/3d4ac.svg",
    unsorted: { left: 34.5, top: 37.8, width: 3.8, height: 7, rotation: 10 },
    sorted: { left: 73.3, top: 35.7, width: 3.4, height: 6.35, rotation: -8.73 },
  },
  {
    id: "red-lego-two",
    name: "second red building block",
    unsortedAsset: "/assets/a2e90.svg",
    sortedAsset: "/assets/a9d62.svg",
    unsorted: { left: 46.5, top: 27.5, width: 3.8, height: 7, rotation: -12 },
    sorted: { left: 76.8, top: 35.7, width: 3.4, height: 6.35, rotation: -8.73 },
  },
  {
    id: "purple-marker",
    name: "purple marker",
    unsortedAsset: "/assets/21eb5.svg",
    sortedAsset: "/assets/21eb5.svg",
    unsorted: { left: 48.5, top: 64.5, width: 4.25, height: 11.8, rotation: 18 },
    sorted: { left: 69.8, top: 42.8, width: 4.25, height: 11.8, rotation: -3.33 },
  },
  {
    id: "red-marker",
    name: "red marker",
    unsortedAsset: "/assets/cbe0c.svg",
    sortedAsset: "/assets/cbe0c.svg",
    unsorted: { left: 30.5, top: 57.5, width: 4.25, height: 11.8, rotation: -20 },
    sorted: { left: 74.1, top: 42.7, width: 4.25, height: 11.8, rotation: 0 },
  },
  {
    id: "green-marker",
    name: "green marker",
    unsortedAsset: "/assets/ee95c.svg",
    sortedAsset: "/assets/ee95c.svg",
    unsorted: { left: 40.5, top: 21.5, width: 1.75, height: 12, rotation: -6 },
    sorted: { left: 78.4, top: 43.1, width: 1.75, height: 12, rotation: -3.33 },
  },
];

export default function App() {
  const [sortedIds, setSortedIds] = useState<string[]>([]);
  const [phoneWiggling, setPhoneWiggling] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleObject = (id: string) => {
    setSortedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  };

  const restartGame = () => {
    setSortedIds([]);
    setPhoneWiggling(false);
    setMenuOpen(false);
  };

  return (
    <main className="game-shell">
      <section className="game-stage" aria-label="Tap the objects to tidy them into the basket">
        <img className="rug-fringe" src="/assets/23d77.svg" alt="" />
        <div className="rug" />

        <img className="basket" src="/assets/042a0.svg" alt="" aria-hidden="true" />

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
          <img src="/assets/69ea2.svg" alt="" />
        </button>

        <button
          type="button"
          className="menu-trigger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="menu-trigger-layer menu-trigger-green" />
          <span className="menu-trigger-layer menu-trigger-yellow" />
          <span className="menu-trigger-layer menu-trigger-purple">MENU</span>
        </button>

        {menuOpen && (
          <div className="menu-backdrop" role="presentation" onClick={() => setMenuOpen(false)}>
            <div
              className="menu-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="menu-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="menu-dialog-green" />
              <div className="menu-dialog-yellow" />
              <div className="menu-dialog-front">
                <h1 id="menu-title">MENU</h1>
                <div className="menu-actions">
                  <button type="button" onClick={() => setMenuOpen(false)}>
                    RESUME
                  </button>
                  <button type="button" onClick={restartGame}>
                    RESTART
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
