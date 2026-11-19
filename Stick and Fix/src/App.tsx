import { useEffect, useState } from 'react'

const TOTAL_TAPS = 12
const assetPath = '/assets'

type GameState = 'start' | 'ready' | 'riding' | 'fallen' | 'treatment'

type PlacedBandage = {
  id: number
  x: number
  y: number
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
    const nextId = placedBandages.length
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100))
    setPlacedBandages((current) => [
      ...current,
      {
        id: nextId,
        x,
        y,
        rotation: ((nextId * 37) % 50) - 25,
      },
    ])
  }

  function startGame(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
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
        setPlacedBandages((current) => [
          ...current,
          {
            id: nextId,
            x: 50,
            y: 48,
            rotation: ((nextId * 37) % 50) - 25,
          },
        ])
        return
      }
      ride()
    }
  }

  const riderAsset = taps % 2 === 0 ? '64c23.svg' : 'bba61.svg'

  return (
    <main
      className="game"
      onClick={handleGameTap}
      onKeyDown={handleKeyDown}
      role={gameState === 'start' || gameState === 'fallen' ? undefined : 'button'}
      tabIndex={gameState === 'start' || gameState === 'fallen' ? -1 : 0}
      aria-label={
        gameState === 'start'
          ? 'Taylor bike game start screen.'
          : gameState === 'treatment'
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

      {gameState === 'start' && (
        <section className="start-screen" aria-label="Bike game start screen">
          <div className="start-stage">
            <img
              className="start-background"
              src={`${assetPath}/831b5.svg`}
              alt=""
              draggable={false}
            />
            <img
              className="start-cloud"
              src={`${assetPath}/898b3.svg`}
              alt=""
              draggable={false}
            />
            <div className="start-taylor" aria-hidden="true">
              <img src={`${assetPath}/f299d.svg`} alt="" draggable={false} />
              <span className="start-mouth-mask" />
              <img
                className="start-mouth"
                src={`${assetPath}/2c8d2.svg`}
                alt=""
                draggable={false}
              />
            </div>
            <img
              className="start-bike"
              src={`${assetPath}/084bb.svg`}
              alt=""
              draggable={false}
            />
            <img
              className="start-bandaid"
              src={`${assetPath}/2575e.svg`}
              alt=""
              draggable={false}
            />
            <button className="start-button" type="button" onClick={startGame}>
              START
            </button>
          </div>
        </section>
      )}

      {gameState !== 'start' && gameState !== 'treatment' && (
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
          <div className="treatment-stage">
            <div className="treatment-ground" aria-hidden="true">
              <div className="treatment-grass" />
              <div className="treatment-sidewalk">
                <span />
                <span />
                <span />
                <span />
              </div>
              <img
                className="treatment-divider"
                src={`${assetPath}/440b0.svg`}
                alt=""
                draggable={false}
              />
            </div>

            <img
              className="treatment-bottom-bar"
              src={`${assetPath}/12699.svg`}
              alt=""
              draggable={false}
            />

            <div className="treatment-arm" aria-hidden="true">
              <img src={`${assetPath}/76796.svg`} alt="" draggable={false} />
              <img
                className="treatment-injury treatment-injury-outer"
                src={`${assetPath}/468bd.svg`}
                alt=""
                draggable={false}
              />
              <img
                className="treatment-injury treatment-injury-inner"
                src={`${assetPath}/3cc40.svg`}
                alt=""
                draggable={false}
              />
            </div>

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
