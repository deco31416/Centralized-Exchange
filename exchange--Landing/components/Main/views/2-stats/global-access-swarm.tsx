"use client";

export default function GlobalAccessSwarm() {
  return (
    <div className="deco-coin-stage" aria-hidden="true">
      <img
        className="deco-coin-gif"
        src="/images/deco-gif/coin-deco.gif"
        alt=""
        loading="eager"
        decoding="async"
      />

      <style jsx>{`
        .deco-coin-stage {
          position: relative;
          display: grid;
          min-height: 100%;
          width: 100%;
          place-items: center;
          overflow: visible;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
        }

        .deco-coin-gif {
          position: relative;
          z-index: 1;
          display: block;
          width: min(82%, 520px);
          max-height: 88%;
          object-fit: contain;
          transform: translateY(2%);
          filter: none;
          mix-blend-mode: normal;
          user-select: none;
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .deco-coin-gif {
            width: min(90%, 360px);
            max-height: 84%;
          }
        }
      `}</style>
    </div>
  );
}
