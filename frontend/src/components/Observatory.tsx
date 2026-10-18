import { useId, useRef } from "react";

/** Code-native optical instrument: input layers pass through an inspection plane. */
export default function Observatory() {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const gradient = (name: string) => `url(#${id}-${name})`;
  return (
    <div
      className="observatory"
      ref={ref}
      onPointerMove={(event) => {
        if (
          window.matchMedia(
            "(prefers-reduced-motion: reduce), (pointer: coarse)",
          ).matches
        )
          return;
        const box = event.currentTarget.getBoundingClientRect();
        ref.current?.style.setProperty(
          "--tilt-x",
          `${((event.clientY - box.top) / box.height - 0.5) * -8}deg`,
        );
        ref.current?.style.setProperty(
          "--tilt-y",
          `${((event.clientX - box.left) / box.width - 0.5) * 10}deg`,
        );
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--tilt-x", "0deg");
        ref.current?.style.setProperty("--tilt-y", "0deg");
      }}
    >
      <div className="instrument-grid" aria-hidden="true" />
      <div className="instrument-glow" aria-hidden="true" />
      <span className="instrument-caption top">
        FIG. 01 <span>/ THE INSPECTION BOUNDARY</span>
      </span>
      <svg
        className="instrument"
        viewBox="0 0 640 620"
        role="img"
        aria-label="Copper optical instrument representing layered prompt inspection"
      >
        <defs>
          <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0.8">
            <stop stopColor="#3a2420" />
            <stop offset=".18" stopColor="#a15d3e" />
            <stop offset=".32" stopColor="#f4b580" />
            <stop offset=".4" stopColor="#fbe2bd" />
            <stop offset=".48" stopColor="#b87850" />
            <stop offset=".63" stopColor="#442a23" />
            <stop offset=".78" stopColor="#171516" />
            <stop offset="1" stopColor="#b47b58" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="0" y1="0" x2=".8" y2="1">
            <stop stopColor="#ffe3bc" />
            <stop offset=".34" stopColor="#8e5135" />
            <stop offset=".55" stopColor="#382320" />
            <stop offset=".8" stopColor="#cf956d" />
            <stop offset="1" stopColor="#412d27" />
          </linearGradient>
          <radialGradient id={`${id}-lens`} cx="40%" cy="30%">
            <stop stopColor="#4b3026" stopOpacity=".8" />
            <stop offset=".55" stopColor="#1c1918" />
            <stop offset="1" stopColor="#0d0d0e" />
          </radialGradient>
          <linearGradient id={`${id}-beam`}>
            <stop stopColor="#eba36d" stopOpacity="0" />
            <stop offset=".5" stopColor="#eba36d" stopOpacity=".7" />
            <stop offset="1" stopColor="#eba36d" stopOpacity="0" />
          </linearGradient>
          <filter
            id={`${id}-shadow`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <ellipse
          cx="325"
          cy="524"
          rx="168"
          ry="22"
          fill="#000"
          opacity=".75"
          filter={gradient("shadow")}
        />
        <g transform="translate(320 297) rotate(-29)">
          <ellipse
            rx="264"
            ry="201"
            fill="none"
            stroke="#b58a6c"
            strokeOpacity=".2"
            strokeDasharray="2 10"
          />
          <ellipse
            rx="239"
            ry="177"
            fill="none"
            stroke="#c59676"
            strokeOpacity=".15"
          />
          <ellipse
            cx="27"
            cy="28"
            rx="188"
            ry="156"
            fill="none"
            stroke="#1c1615"
            strokeWidth="54"
          />
          <ellipse
            cx="21"
            cy="21"
            rx="188"
            ry="156"
            fill="none"
            stroke={gradient("edge")}
            strokeWidth="47"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="188"
            ry="156"
            fill="none"
            stroke={gradient("metal")}
            strokeWidth="48"
          />
          <ellipse
            rx="188"
            ry="156"
            fill={gradient("lens")}
            stroke={gradient("metal")}
            strokeWidth="41"
          />
          <ellipse
            rx="207"
            ry="176"
            fill="none"
            stroke="#edc09b"
            strokeOpacity=".5"
            strokeWidth="1.2"
          />
          <ellipse
            rx="168"
            ry="136"
            fill="none"
            stroke="#f0ba87"
            strokeOpacity=".75"
            strokeWidth="1.4"
          />
          <ellipse
            rx="157"
            ry="126"
            fill="none"
            stroke="#77503c"
            strokeWidth="2"
          />
          <ellipse
            rx="145"
            ry="116"
            fill="none"
            stroke="#3f3029"
            strokeWidth=".8"
          />
          {Array.from({ length: 64 }, (_, index) => {
            const angle = (index * Math.PI) / 32;
            return (
              <line
                key={index}
                x1={Math.cos(angle) * 177}
                y1={Math.sin(angle) * 145}
                x2={Math.cos(angle) * (index % 4 === 0 ? 188 : 183)}
                y2={Math.sin(angle) * (index % 4 === 0 ? 156 : 151)}
                stroke="#f2c4a0"
                strokeWidth={index % 4 === 0 ? 1.2 : 0.7}
                opacity=".55"
              />
            );
          })}
          <path
            d="M-111 -82 L91 -82 L111 -62 L111 82 L-111 82 Z"
            fill="#ead2b0"
            fillOpacity=".035"
            stroke="#c28d69"
            strokeOpacity=".3"
          />
          {[-45, -28, -11, 6, 23, 40].map((y, i) => (
            <line
              key={y}
              x1="-72"
              y1={y}
              x2={i % 3 === 0 ? 45 : 76}
              y2={y}
              stroke="#b9a89a"
              strokeOpacity={i === 2 ? 0.8 : 0.22}
              strokeWidth={i === 2 ? 2 : 1}
            />
          ))}
          <path d="M-108 -6 H112" stroke="#edac79" strokeWidth="2" />
          <circle r="7" cx="112" cy="-6" fill="#f0c8a4" />
          <circle
            r="15"
            cx="112"
            cy="-6"
            fill="none"
            stroke="#c58f69"
            strokeOpacity=".4"
          />
        </g>
        <path
          d="M30 360 H171 M449 239 H610"
          stroke={gradient("beam")}
          strokeWidth="1"
        />
        <path
          d="M87 450 H143 L185 407 M451 136 H520 L547 108"
          fill="none"
          stroke="#8b6652"
          strokeOpacity=".6"
          strokeWidth=".8"
        />
        <circle cx="185" cy="407" r="3" fill="#dfa77d" />
        <circle cx="451" cy="136" r="3" fill="#dfa77d" />
        <text
          x="42"
          y="472"
          fill="#a49a90"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="2"
        >
          RAW INPUT
        </text>
        <text
          x="469"
          y="94"
          fill="#d3a584"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="2"
        >
          INSPECT / CLASSIFY
        </text>
        <path
          d="M319 68 V79 M319 533 V545 M65 297 H76 M563 297 H575"
          stroke="#c39879"
          strokeWidth="1"
        />
      </svg>
      <div className="instrument-caption bottom">
        <span>
          <i /> INTERACTIVE STUDY
        </span>
        <span>TF–IDF × LOGISTIC REGRESSION</span>
      </div>
    </div>
  );
}
