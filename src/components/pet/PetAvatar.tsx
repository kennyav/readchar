'use client';

import { motion } from 'framer-motion';
import type { Pet, PetStage, PetTraits } from '@/types/reading';

const BOB_TRANSITION = {
  duration: 2.2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

export type PetAnimation = 'idle' | 'run';

interface PetAvatarProps {
  pet: Pet;
  size?: number;
  /** When 'run', pet runs across the area with a bouncy stride (still procedural, no art). */
  animation?: PetAnimation;
}

// Pokémon-style: thick black outline, flat colors, readable silhouettes
const OUTLINE = '#1a1a1a';
const OUTLINE_WIDTH = 2.5;

/** Evolution line: 0 = Charmander (fire/dragon), 1 = Squirtle (turtle), 2 = Bulbasaur (plant). */
type EvolutionLine = 0 | 1 | 2;

const cx = 100;
const cy = 100;

// ─── Egg (same for all lines; color hints at future evolution) ───
function renderEgg(traits: PetTraits) {
  const rx = 36;
  const ry = 50;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 10} cy={cy - 16} rx={10} ry={14} fill={traits.secondaryColor} opacity={0.5} />
    </g>
  );
}

// ─── Line 0: Charmander (fire lizard → dragon) ───
// Hatchling: small bipedal lizard with tail and flame nub
function renderCharmanderHatchling(traits: PetTraits) {
  const s = 0.9;
  return (
    <g>
      <ellipse cx={cx} cy={cy - 4 * s} rx={28 * s} ry={26 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 20 * s} cy={cy + 28 * s} rx={10 * s} ry={14 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 20 * s} cy={cy + 28 * s} rx={10 * s} ry={14 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <path d={`M ${cx + 32 * s} ${cy + 8 * s} Q ${cx + 50 * s} ${cy + 2} ${cx + 48 * s} ${cy + 20 * s}`} fill="none" stroke={traits.primaryColor} strokeWidth={OUTLINE_WIDTH} strokeLinecap="round" />
      <circle cx={cx + 50 * s} cy={cy + 18 * s} r={8 * s} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
    </g>
  );
}

// Adult: dragon with body, little feet, wings and flame tail (tail at back, head in front)
function renderCharmanderAdult(traits: PetTraits) {
  const r = 38;
  return (
    <g>
      <path d={`M ${cx - r * 0.5} ${cy + 36} Q ${cx - 52} ${cy + 48} ${cx - 48} ${cy + 58}`} fill="none" stroke={traits.primaryColor} strokeWidth={OUTLINE_WIDTH} strokeLinecap="round" />
      <circle cx={cx - 48} cy={cy + 55} r={12} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx} cy={cy + 32} rx={r * 0.5} ry={r * 0.7} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <path d={`M ${cx - r * 0.65} ${cy - r * 0.3} Q ${cx - r * 1.5} ${cy - r * 0.8} ${cx - r * 1.1} ${cy} Q ${cx - r * 1.35} ${cy + r * 0.45} ${cx - r * 0.6} ${cy + r * 0.15} Z`} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} opacity={0.95} />
      <path d={`M ${cx + r * 0.65} ${cy - r * 0.3} Q ${cx + r * 1.5} ${cy - r * 0.8} ${cx + r * 1.1} ${cy} Q ${cx + r * 1.35} ${cy + r * 0.45} ${cx + r * 0.6} ${cy + r * 0.15} Z`} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} opacity={0.95} />
      <ellipse cx={cx - 18} cy={cy + 58} rx={10} ry={8} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 18} cy={cy + 58} rx={10} ry={8} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 11} cy={cy + 28} rx={9} ry={7} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 11} cy={cy + 28} rx={9} ry={7} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx} cy={cy - 8} rx={r * 0.85} ry={r * 0.7} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
    </g>
  );
}

// ─── Line 1: Squirtle (turtle) ───
// Hatchling: small round turtle with shell
function renderSquirtleHatchling(traits: PetTraits) {
  const s = 0.88;
  return (
    <g>
      <ellipse cx={cx} cy={cy + 6 * s} rx={32 * s} ry={28 * s} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx} cy={cy + 4 * s} rx={26 * s} ry={22 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 22 * s} cy={cy + 32 * s} rx={8 * s} ry={10 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 22 * s} cy={cy + 32 * s} rx={8 * s} ry={10 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 26 * s} cy={cy + 12 * s} rx={6 * s} ry={9 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 26 * s} cy={cy + 12 * s} rx={6 * s} ry={9 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
    </g>
  );
}

// Adult: larger turtle with prominent shell
function renderSquirtleAdult(traits: PetTraits) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + 12} rx={42} ry={32} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx} cy={cy + 8} rx={34} ry={26} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 28} cy={cy + 40} rx={12} ry={16} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 28} cy={cy + 40} rx={12} ry={16} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 34} cy={cy + 18} rx={10} ry={14} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 34} cy={cy + 18} rx={10} ry={14} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
    </g>
  );
}

// ─── Line 2: Bulbasaur (plant quadruped) ───
// Hatchling: small quadruped with bulb on back
function renderBulbasaurHatchling(traits: PetTraits) {
  const s = 0.88;
  return (
    <g>
      <circle cx={cx} cy={cy - 18 * s} r={18 * s} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx} cy={cy + 8 * s} rx={28 * s} ry={22 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 22 * s} cy={cy + 36 * s} rx={8 * s} ry={12 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 22 * s} cy={cy + 36 * s} rx={8 * s} ry={12 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 26 * s} cy={cy + 14 * s} rx={6 * s} ry={10 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 26 * s} cy={cy + 14 * s} rx={6 * s} ry={10 * s} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
    </g>
  );
}

// Adult: quadruped with flower on back
function renderBulbasaurAdult(traits: PetTraits) {
  return (
    <g>
      <path d={`M ${cx} ${cy - 45} Q ${cx - 18} ${cy - 55} ${cx - 12} ${cy - 38} Q ${cx} ${cy - 42} ${cx + 12} ${cy - 38} Q ${cx + 18} ${cy - 55} ${cx} ${cy - 45} Z`} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <circle cx={cx} cy={cy - 42} r={14} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx} cy={cy + 10} rx={36} ry={28} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 30} cy={cy + 42} rx={11} ry={16} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 30} cy={cy + 42} rx={11} ry={16} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx - 35} cy={cy + 18} rx={9} ry={14} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={cx + 35} cy={cy + 18} rx={9} ry={14} fill={traits.primaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
    </g>
  );
}

// ─── Eyes: wide style only (big white + pupil + highlight) ───
function renderEyes(traits: PetTraits, stage: PetStage) {
  const scale = stage === 'hatchling' ? 1.15 : 1;
  const leftX = cx - 14 * scale;
  const rightX = cx + 14 * scale;
  const eyeY = cy - (stage === 'hatchling' ? 6 : 10) * scale;

  return (
    <g>
      <ellipse cx={leftX} cy={eyeY} rx={9 * scale} ry={11 * scale} fill="#fff" stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <ellipse cx={rightX} cy={eyeY} rx={9 * scale} ry={11 * scale} fill="#fff" stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <circle cx={leftX} cy={eyeY + 2} r={5 * scale} fill={OUTLINE} />
      <circle cx={rightX} cy={eyeY + 2} r={5 * scale} fill={OUTLINE} />
      <circle cx={leftX + 2} cy={eyeY - 1} r={2 * scale} fill="#fff" />
      <circle cx={rightX + 2} cy={eyeY - 1} r={2 * scale} fill="#fff" />
    </g>
  );
}

// ─── Mouth: 0 = closed smile (less curved), 1 = open, 2 = smile with tooth ───
function renderMouth(traits: PetTraits, stage: PetStage) {
  const scale = stage === 'hatchling' ? 1.15 : 1;
  const mouthY = cy + (stage === 'hatchling' ? 8 : 12) * scale;
  const w = 12 * scale;
  const style = traits.mouthStyle ?? 0;

  if (style === 1) {
    // Open mouth: filled smile shape (U with curved bottom)
    const w2 = 10 * scale;
    const depth = 6 * scale;
    return (
      <path
        d={`M ${cx - w2} ${mouthY} Q ${cx} ${mouthY + depth} ${cx + w2} ${mouthY} Z`}
        fill={OUTLINE}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
      />
    );
  }

  if (style === 2) {
    // Smile with tooth sticking out (one side)
    const curve = 2.5 * scale;
    return (
      <g>
        <path
          d={`M ${cx - w} ${mouthY} Q ${cx} ${mouthY + curve} ${cx + w} ${mouthY}`}
          fill="none"
          stroke={OUTLINE}
          strokeWidth={OUTLINE_WIDTH}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx + w - 2} ${mouthY} L ${cx + w + 6 * scale} ${mouthY - 4 * scale} L ${cx + w + 6 * scale} ${mouthY + 4 * scale} Z`}
          fill="#fff"
          stroke={OUTLINE}
          strokeWidth={OUTLINE_WIDTH}
        />
      </g>
    );
  }

  // 0: Closed smile (less curved)
  const curve = 2.5 * scale;
  return (
    <path
      d={`M ${cx - w} ${mouthY} Q ${cx} ${mouthY + curve} ${cx + w} ${mouthY}`}
      fill="none"
      stroke={OUTLINE}
      strokeWidth={OUTLINE_WIDTH}
      strokeLinecap="round"
    />
  );
}

// Accessory only on adult
function renderAccessory(traits: PetTraits) {
  if (!traits.accessory) return null;

  if (traits.accessory === 'hat') {
    return (
      <g transform={`translate(${cx}, ${cy - 48})`}>
        <path d="M -20 0 L 0 -32 L 20 0 Z" fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
        <ellipse cx={0} cy={6} rx={24} ry={7} fill={traits.secondaryColor} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      </g>
    );
  }
  if (traits.accessory === 'glasses') {
    return (
      <g transform={`translate(${cx}, ${cy - 10})`}>
        <ellipse cx={-16} cy={0} rx={12} ry={13} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
        <ellipse cx={16} cy={0} rx={12} ry={13} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
        <line x1={-4} y1={0} x2={4} y2={0} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      </g>
    );
  }
  return null;
}

// Dispatch body by evolution line + stage (Charmander / Squirtle / Bulbasaur)
function renderSpecies(traits: PetTraits, stage: PetStage) {
  const line = Math.min(2, Math.max(0, traits.bodyType)) as EvolutionLine;
  if (stage === 'egg') return renderEgg(traits);
  if (stage === 'hatchling') {
    if (line === 0) return renderCharmanderHatchling(traits);
    if (line === 1) return renderSquirtleHatchling(traits);
    return renderBulbasaurHatchling(traits);
  }
  if (line === 0) return renderCharmanderAdult(traits);
  if (line === 1) return renderSquirtleAdult(traits);
  return renderBulbasaurAdult(traits);
}

const RUN_X_DURATION = 2.8;
const RUN_BOUNCE_DURATION = 0.25;

export function PetAvatar({ pet, size = 200, animation = 'idle' }: PetAvatarProps) {
  const { traits, stage } = pet;
  const isRunning = animation === 'run';

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
      role="img"
      aria-label={isRunning ? `${pet.name} running` : `${pet.name}, ${stage} pet`}
    >
      {/* Layer 1: background + shadow — fixed on y, shadow has its own subtle motion */}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <rect x={0} y={0} width={200} height={200} rx={16} fill="hsl(var(--reading-bg, #F9F6F1))" />
        {!isRunning && (
          <motion.ellipse
            cx={100}
            cy={185}
            fill="#2C2C2E"
            animate={{
              rx: [60, 48, 60],
              ry: [8, 5, 8],
              opacity: [0.08, 0.04, 0.08],
            }}
            transition={BOB_TRANSITION}
          />
        )}
      </svg>
      {/* Layer 2: pet — idle bobs; run moves across with bounce */}
      <motion.div
        className="absolute flex items-center justify-center pointer-events-none"
        style={{ width: size, height: size, left: isRunning ? undefined : 0, top: 0 }}
        animate={
          isRunning
            ? {
                x: [-size, size],
                y: [0, -10, 0, -10, 0],
              }
            : { x: 0, y: [0, -12, 0] }
        }
        transition={
          isRunning
            ? {
                x: { duration: RUN_X_DURATION, repeat: Infinity, ease: 'linear' },
                y: { duration: RUN_BOUNCE_DURATION, repeat: Infinity, ease: 'easeInOut' },
              }
            : {
                x: { duration: 0.25, ease: 'easeOut' },
                y: { duration: BOB_TRANSITION.duration, repeat: Infinity, ease: BOB_TRANSITION.ease },
              }
        }
      >
        <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden className="flex-shrink-0">
          <g>
            {isRunning && (
              <motion.ellipse
                cx={100}
                cy={185}
                fill="#2C2C2E"
                animate={{
                  rx: [60, 48, 60],
                  ry: [8, 5, 8],
                  opacity: [0.08, 0.04, 0.08],
                }}
                transition={BOB_TRANSITION}
              />
            )}
            {renderSpecies(traits, stage)}
            {stage !== 'egg' && (
              <>
                {renderEyes(traits, stage)}
                {renderMouth(traits, stage)}
                {stage === 'adult' && renderAccessory(traits)}
              </>
            )}
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
