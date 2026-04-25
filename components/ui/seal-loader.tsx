'use client';

// Brand-mark loader for long-running screens (results page during live
// search). Inline SVG of a hand holding a lotus inside a rectangular seal
// frame, drawn in bindi red on cream. Each path animates in with a stagger,
// then the whole thing fades and re-draws on a 5.5s loop. Keyframes live in
// app/globals.css under .zarf-seal-path; prefers-reduced-motion turns the
// animation off and shows the seal static.

interface SealLoaderProps {
  caption?: string;
}

export function SealLoader({ caption }: SealLoaderProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <svg
        viewBox="0 0 120 200"
        className="h-44 w-auto md:h-56"
        fill="none"
        stroke="#8e1929"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Seal frame */}
        <rect
          x="12" y="12" width="96" height="176" rx="2"
          pathLength="1"
          className="zarf-seal-path"
          style={{ animationDelay: '0s' }}
        />

        {/* Lotus: center petal */}
        <path
          d="M 60 78 C 53 64 53 46 60 30 C 67 46 67 64 60 78 Z"
          pathLength="1"
          className="zarf-seal-path"
          style={{ animationDelay: '0.3s' }}
        />
        {/* Lotus: left petal */}
        <path
          d="M 60 75 C 49 70 39 58 41 44 C 48 52 55 64 60 75 Z"
          pathLength="1"
          className="zarf-seal-path"
          style={{ animationDelay: '0.5s' }}
        />
        {/* Lotus: right petal */}
        <path
          d="M 60 75 C 71 70 81 58 79 44 C 72 52 65 64 60 75 Z"
          pathLength="1"
          className="zarf-seal-path"
          style={{ animationDelay: '0.5s' }}
        />

        {/* Stem */}
        <path
          d="M 60 78 L 60 112"
          pathLength="1"
          className="zarf-seal-path"
          style={{ animationDelay: '0.8s' }}
        />

        {/* Hand: back of closed fist holding the stem */}
        <path
          d="M 35 152 C 35 122 47 110 60 110 C 73 110 85 122 85 152 L 80 167 L 40 167 Z"
          pathLength="1"
          className="zarf-seal-path"
          style={{ animationDelay: '1.0s' }}
        />

        {/* Knuckle creases */}
        <path d="M 45 130 Q 50 125 55 130" pathLength="1" className="zarf-seal-path" style={{ animationDelay: '1.3s' }} />
        <path d="M 55 128 Q 60 123 65 128" pathLength="1" className="zarf-seal-path" style={{ animationDelay: '1.4s' }} />
        <path d="M 65 130 Q 70 125 75 130" pathLength="1" className="zarf-seal-path" style={{ animationDelay: '1.5s' }} />

        {/* Thumb curl on the right */}
        <path
          d="M 84 138 Q 92 144 86 154"
          pathLength="1"
          className="zarf-seal-path"
          style={{ animationDelay: '1.7s' }}
        />

        {/* Wrist */}
        <path
          d="M 45 167 L 45 178 M 75 167 L 75 178"
          pathLength="1"
          className="zarf-seal-path"
          style={{ animationDelay: '1.9s' }}
        />
      </svg>
      {caption && (
        <p className="max-w-prose text-center text-sm text-muted">
          {caption}
        </p>
      )}
    </div>
  );
}
