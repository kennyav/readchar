'use client';

import { motion } from 'framer-motion';
import type { Pet, PetStage, PetTraits } from '@/types/reading';

const BOB_TRANSITION = {
  duration: 2.2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

interface PetAvatarProps {
  pet: Pet;
  size?: number;
}

const STAGE_SCALE: Record<PetStage, number> = {
  egg: 0.6,
  hatchling: 0.85,
  adult: 1,
};

function renderBody(traits: PetTraits, stage: PetStage) {
  const scale = STAGE_SCALE[stage];
  const cx = 100;
  const cy = 100;
  const stroke = '#2C2C2E';

  switch (traits.bodyType) {
    case 1: {
      // Quadruped: rounded body + four legs
      const w = 70 * scale;
      const h = 50 * scale;
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} fill={traits.primaryColor} stroke={stroke} strokeWidth={2} />
          <ellipse cx={cx - 28 * scale} cy={cy + 35 * scale} rx={10 * scale} ry={18 * scale} fill={traits.primaryColor} stroke={stroke} strokeWidth={1.5} />
          <ellipse cx={cx + 28 * scale} cy={cy + 35 * scale} rx={10 * scale} ry={18 * scale} fill={traits.primaryColor} stroke={stroke} strokeWidth={1.5} />
          <ellipse cx={cx - 32 * scale} cy={cy + 8 * scale} rx={8 * scale} ry={14 * scale} fill={traits.primaryColor} stroke={stroke} strokeWidth={1.5} />
          <ellipse cx={cx + 32 * scale} cy={cy + 8 * scale} rx={8 * scale} ry={14 * scale} fill={traits.primaryColor} stroke={stroke} strokeWidth={1.5} />
        </g>
      );
    }
    case 2: {
      // Winged: blob body + two wings
      const r = 45 * scale;
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill={traits.primaryColor} stroke={stroke} strokeWidth={2} />
          <path
            d={`M ${cx - r * 0.6} ${cy - r * 0.3} Q ${cx - r * 1.6} ${cy - r * 0.8} ${cx - r * 1.2} ${cy} Q ${cx - r * 1.4} ${cy + r * 0.4} ${cx - r * 0.6} ${cy + r * 0.2} Z`}
            fill={traits.secondaryColor}
            stroke={stroke}
            strokeWidth={1.5}
            opacity={0.9}
          />
          <path
            d={`M ${cx + r * 0.6} ${cy - r * 0.3} Q ${cx + r * 1.6} ${cy - r * 0.8} ${cx + r * 1.2} ${cy} Q ${cx + r * 1.4} ${cy + r * 0.4} ${cx + r * 0.6} ${cy + r * 0.2} Z`}
            fill={traits.secondaryColor}
            stroke={stroke}
            strokeWidth={1.5}
            opacity={0.9}
          />
        </g>
      );
    }
    default: {
      // Blob: soft ellipse
      const rx = 50 * scale;
      const ry = 45 * scale;
      return (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={traits.primaryColor} stroke={stroke} strokeWidth={2} />
      );
    }
  }
}

function renderMarkings(traits: PetTraits, stage: PetStage) {
  if (traits.markingStyle === 0) return null;
  const scale = STAGE_SCALE[stage];
  const cx = 100;
  const cy = 100;
  const stroke = '#2C2C2E';
  const fill = traits.secondaryColor;

  if (traits.markingStyle === 1) {
    return (
      <g opacity={0.8}>
        <circle cx={cx - 15 * scale} cy={cy - 10 * scale} r={8 * scale} fill={fill} stroke={stroke} strokeWidth={1} />
        <circle cx={cx + 18 * scale} cy={cy - 5 * scale} r={6 * scale} fill={fill} stroke={stroke} strokeWidth={1} />
        <circle cx={cx} cy={cy + 15 * scale} r={7 * scale} fill={fill} stroke={stroke} strokeWidth={1} />
      </g>
    );
  }
  // Stripes
  return (
    <g opacity={0.7} stroke={fill} strokeWidth={4 * scale} strokeLinecap="round">
      <line x1={cx - 35 * scale} y1={cy - 15 * scale} x2={cx - 25 * scale} y2={cy + 20 * scale} />
      <line x1={cx} y1={cy - 25 * scale} x2={cx} y2={cy + 25 * scale} />
      <line x1={cx + 35 * scale} y1={cy - 10 * scale} x2={cx + 25 * scale} y2={cy + 22 * scale} />
    </g>
  );
}

function renderEyes(traits: PetTraits, stage: PetStage) {
  const scale = STAGE_SCALE[stage];
  const cx = 100;
  const cy = 100;
  const leftX = cx - 14 * scale;
  const rightX = cx + 14 * scale;
  const eyeY = cy - 8 * scale;
  const stroke = '#2C2C2E';

  switch (traits.eyeStyle) {
    case 1:
      return (
        <g>
          <ellipse cx={leftX} cy={eyeY} rx={8 * scale} ry={10 * scale} fill="#fff" stroke={stroke} strokeWidth={1.5} />
          <ellipse cx={rightX} cy={eyeY} rx={8 * scale} ry={10 * scale} fill="#fff" stroke={stroke} strokeWidth={1.5} />
          <circle cx={leftX} cy={eyeY + 2} r={5 * scale} fill={stroke} />
          <circle cx={rightX} cy={eyeY + 2} r={5 * scale} fill={stroke} />
          <circle cx={leftX + 2} cy={eyeY - 1} r={2 * scale} fill="#fff" />
          <circle cx={rightX + 2} cy={eyeY - 1} r={2 * scale} fill="#fff" />
        </g>
      );
    case 2:
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round">
          <path d={`M ${leftX - 6} ${eyeY} Q ${leftX} ${eyeY - 6} ${leftX + 6} ${eyeY}`} fill="none" />
          <path d={`M ${rightX - 6} ${eyeY} Q ${rightX} ${eyeY - 6} ${rightX + 6} ${eyeY}`} fill="none" />
        </g>
      );
    default:
      return (
        <g>
          <circle cx={leftX} cy={eyeY} r={5 * scale} fill={stroke} />
          <circle cx={rightX} cy={eyeY} r={5 * scale} fill={stroke} />
          <circle cx={leftX + 1.5} cy={eyeY - 1.5} r={1.5 * scale} fill="#fff" />
          <circle cx={rightX + 1.5} cy={eyeY - 1.5} r={1.5 * scale} fill="#fff" />
        </g>
      );
  }
}

function renderAccessory(traits: PetTraits, stage: PetStage) {
  if (!traits.accessory) return null;
  const scale = STAGE_SCALE[stage];
  const cx = 100;
  const cy = 100;
  const stroke = '#2C2C2E';

  if (traits.accessory === 'hat') {
    return (
      <g transform={`translate(${cx}, ${cy - 42 * scale})`}>
        <path
          d={`M -18 0 L 0 -28 L 18 0 Z`}
          fill={traits.secondaryColor}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <ellipse cx={0} cy={4} rx={22} ry={6} fill={traits.secondaryColor} stroke={stroke} strokeWidth={1.5} />
      </g>
    );
  }
  if (traits.accessory === 'scarf') {
    return (
      <g transform={`translate(${cx}, ${cy + 15 * scale})`}>
        <path
          d={`M -35 0 Q 0 25 35 0 Q 30 35 -30 35 Z`}
          fill={traits.secondaryColor}
          stroke={stroke}
          strokeWidth={1.2}
          opacity={0.95}
        />
      </g>
    );
  }
  if (traits.accessory === 'glasses') {
    const r = 10 * scale;
    return (
      <g transform={`translate(${cx}, ${cy - 8 * scale})`}>
        <ellipse cx={-14} cy={0} rx={r} ry={r * 1.1} fill="none" stroke={stroke} strokeWidth={2} />
        <ellipse cx={14} cy={0} rx={r} ry={r * 1.1} fill="none" stroke={stroke} strokeWidth={2} />
        <line x1={-14 + r} y1={0} x2={14 - r} y2={0} stroke={stroke} strokeWidth={1.5} />
      </g>
    );
  }
  return null;
}

export function PetAvatar({ pet, size = 200 }: PetAvatarProps) {
  const { traits, stage } = pet;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pet.name}, ${stage} pet`}
    >
      {/* Layer 1: background + shadow — fixed on y, shadow has its own subtle motion */}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="absolute inset-0"
        aria-hidden
      >
        <rect x={0} y={0} width={200} height={200} rx={16} fill="hsl(var(--reading-bg, #F9F6F1))" />
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
      </svg>
      {/* Layer 2: pet only — bobs up and down */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ width: size, height: size }}
        animate={{ y: [0, -12, 0] }}
        transition={BOB_TRANSITION}
      >
        <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden>
          <g>
            {renderBody(traits, stage)}
            {renderMarkings(traits, stage)}
            {renderEyes(traits, stage)}
            {renderAccessory(traits, stage)}
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
