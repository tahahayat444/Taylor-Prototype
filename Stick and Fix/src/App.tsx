import { useEffect, useState } from 'react'

const TOTAL_TAPS = 12
const assetPath = `${import.meta.env.BASE_URL}assets`
const TREATMENT_SCENE_WIDTH = 3724
const TREATMENT_SCENE_HEIGHT = 2866

function isArmPosition(x: number, y: number) {
  const sceneX = (x / 100) * TREATMENT_SCENE_WIDTH
  const sceneY = (y / 100) * TREATMENT_SCENE_HEIGHT

  // These bounds follow the palm and forearm shapes in treatment-scene.svg.
  const inPalm =
    ((sceneX - 2190.28) / 226.03) ** 2 + ((sceneY - 1689.02) / 269.05) ** 2 <= 1
  const inForearm =
    sceneX >= 2058.1 && sceneX <= 2328.714 && sceneY >= 1886.11

  return inPalm || inForearm
}

function GrassSymbol({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 166 194" aria-hidden="true">
      <path
        d="M1860.66 2641.43C1894.16 2645.18 1948.61 2596.92 1948.61 2560.99C1944.42 2536 1912.59 2487.89 1818.77 2495.39M1948.61 2560.99H1860.66"
        transform="translate(-1800.78 -2469.9)"
        fill="none"
        stroke="#447B2A"
        strokeLinecap="round"
        strokeWidth="35.9776"
      />
    </svg>
  )
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="start-screen" aria-labelledby="stick-and-fix-title">
      <h1 className="opening-title" id="stick-and-fix-title">
        STICK AND
        <br />
        FIX
      </h1>

      <div className="opening-taylor-motion" aria-hidden="true">
        <img src={`${assetPath}/opening-taylor.svg`} alt="" draggable={false} />
      </div>

      <div className="opening-bandage-motion" aria-hidden="true">
        <img src={`${assetPath}/opening-bandage.svg`} alt="" draggable={false} />
      </div>

      <button className="start-button" type="button" onClick={onStart}>
        START
      </button>
    </section>
  )
}

type GameState = 'start' | 'ready' | 'riding' | 'fallen' | 'treatment'

type PlacedBandage = {
  id: number
  x: number
  y: number
  size: number
  rotation: number
}

export default function App() {
  const [taps, setTaps] = useState(0)
  const [gameState, setGameState] = useState<GameState>('start')
  const [placedBandages, setPlacedBandages] = useState<PlacedBandage[]>([])

  const progress = Math.min(taps / TOTAL_TAPS, 1)
  const riderPosition = 7 + progress * 69

  useEffect(() => {
    if (gameState !== 'treatment' || placedBandages.length < 10) return

    const restartTimer = window.setTimeout(() => {
      setPlacedBandages([])
      setTaps(0)
      setGameState('start')
    }, 650)

    return () => window.clearTimeout(restartTimer)
  }, [gameState, placedBandages.length])

  function ride() {
    if (gameState === 'start') return

    if (gameState === 'fallen' || gameState === 'treatment') return

    const nextTap = taps + 1
    setTaps(nextTap)

    if (nextTap >= TOTAL_TAPS) {
      setGameState('fallen')
      return
    }

    setGameState('riding')
  }

  function handleGameTap(event: React.MouseEvent<HTMLElement>) {
    if (gameState !== 'treatment') {
      ride()
      return
    }

    if (placedBandages.length >= 10) return

    const stage = event.currentTarget.querySelector<HTMLElement>('.treatment-stage')
    if (!stage) return

    const bounds = stage.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      return
    }

    const nextId = placedBandages.length
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100))
    setPlacedBandages((current) => [
      ...current,
      {
        id: nextId,
        x,
        y,
        size: isArmPosition(x, y) ? 5.2 : 3.2,
        rotation: ((nextId * 37) % 50) - 25,
      },
    ])
  }

  function startGame() {
    setTaps(0)
    setGameState('ready')
  }

  function startTreatment(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setPlacedBandages([])
    setGameState('treatment')
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (gameState === 'treatment') {
        if (placedBandages.length >= 10) return
        const nextId = placedBandages.length
        const x = 59.7
        const y = 77
        setPlacedBandages((current) => [
          ...current,
          {
            id: nextId,
            x,
            y,
            size: isArmPosition(x, y) ? 5.2 : 3.2,
            rotation: ((nextId * 37) % 50) - 25,
          },
        ])
        return
      }
      ride()
    }
  }

  const riderAsset = taps % 2 === 0 ? '64c23.svg' : 'bba61.svg'

  if (gameState === 'start') {
    return (
      <main className="game">
        <StartScreen onStart={startGame} />
      </main>
    )
  }

  return (
    <main
      className="game"
      onClick={handleGameTap}
      onKeyDown={handleKeyDown}
      role={gameState === 'fallen' ? undefined : 'button'}
      tabIndex={gameState === 'fallen' ? -1 : 0}
      aria-label={
        gameState === 'treatment'
          ? 'Tap anywhere to place a bandage on Taylor.'
          : gameState === 'fallen'
          ? 'Taylor has fallen. Select BandAid to help him.'
          : 'Tap to help Taylor ride forward.'
      }
    >
      <img
        className="scene-background"
        src={`${assetPath}/ab055.svg`}
        alt=""
        draggable={false}
      />

      {gameState !== 'treatment' && (
        <header className="game-header">
          <button
            className="menu-sign"
            type="button"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            aria-label="Menu"
          >
            <span>MENU</span>
          </button>

          {gameState !== 'fallen' && (
            <div className="progress-card" aria-label={`${taps} of ${TOTAL_TAPS} pedals`}>
              <span>FINISH</span>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          )}
        </header>
      )}

      {(gameState === 'ready' || gameState === 'riding') && (
        <div
          className="rider"
          style={{ left: `${riderPosition}%` }}
          aria-hidden="true"
        >
          <img
            key={riderAsset}
            src={`${assetPath}/${riderAsset}`}
            alt=""
            draggable={false}
          />
        </div>
      )}

      {gameState === 'fallen' && (
        <>
          <div className="fall-scene" aria-hidden="true">
            <svg
              className="injured-character"
              viewBox="0 -20 337.709 481.757"
              aria-hidden="true"
            >
              <image href={`${assetPath}/4bee0.svg`} width="337.709" height="461.757" />
              <ellipse
                cx="249.5"
                cy="182"
                rx="25"
                ry="13"
                fill="#85eb66"
                transform="rotate(-17 249.5 182)"
              />
              <image
                href={`${assetPath}/468bd.svg`}
                x="228"
                y="171"
                width="44"
                height="25.5"
                transform="rotate(-15 250 183.75)"
              />
              <image
                href={`${assetPath}/3cc40.svg`}
                x="234"
                y="175"
                width="35"
                height="21"
                transform="rotate(-15 251.5 185.5)"
              />
              <image
                href={`${assetPath}/1fc44.svg`}
                x="142"
                y="-20"
                width="142.031"
                height="87.051"
              />
              <image
                href={`${assetPath}/b5626.svg`}
                x="180"
                y="59"
                width="32.071"
                height="91.633"
              />
              <rect
                x="204"
                y="142"
                width="11.104"
                height="3.626"
                rx="1.813"
                fill="#323232"
              />
            </svg>
            <svg
              className="fallen-bike-group"
              viewBox="0 0 691.836 108.215"
              aria-hidden="true"
            >
              <image href={`${assetPath}/4c3d2.svg`} width="691.836" height="103.815" />
              <image href={`${assetPath}/c00f6.svg`} width="691.836" height="108.215" />
            </svg>
          </div>
          <button className="bandaid-button" type="button" onClick={startTreatment}>
            BandAid
          </button>
        </>
      )}

      {gameState === 'treatment' && (
        <section className="treatment-screen" aria-label="Bandage Taylor's injured arm">
          <div className="treatment-gutter treatment-gutter-left" aria-hidden="true">
            <GrassSymbol className="treatment-gutter-mark treatment-gutter-mark-one" />
            <GrassSymbol className="treatment-gutter-mark treatment-gutter-mark-two" />
            <GrassSymbol className="treatment-gutter-mark treatment-gutter-mark-three" />
            <GrassSymbol className="treatment-gutter-mark treatment-gutter-mark-four" />
          </div>
          <div className="treatment-gutter treatment-gutter-right" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="treatment-stage">
            <img
              className="treatment-background"
              src={`${assetPath}/treatment-scene.svg`}
              alt=""
              draggable={false}
            />

            {placedBandages.length === 0 && (
              <div className="tap-to-bandage" aria-hidden="true">
                Tap to bandage
              </div>
            )}

            <div className="bandage-counter" aria-label={`${placedBandages.length} of 10 bandages`}>
              {placedBandages.length} / 10
            </div>

            {placedBandages.map((bandage) => (
              <img
                key={bandage.id}
                className="placed-bandage"
                src={`${assetPath}/5e9fd.svg`}
                alt=""
                draggable={false}
                style={{
                  left: `${bandage.x}%`,
                  top: `${bandage.y}%`,
                  width: `${bandage.size}%`,
                  rotate: `${bandage.rotation}deg`,
                }}
              />
            ))}
          </div>
        </section>
      )}

    </main>
  )
}
