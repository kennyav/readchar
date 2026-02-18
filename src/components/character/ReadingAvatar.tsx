"use client"

import { useMemo } from "react"
import type { Book } from "@/types/reading"
import { deriveBaseTraits } from "@/lib/avatar-seed"
import { computeCharacterLayers } from "@/lib/avatar-traits"
import type { CharacterLayers, CharacterTraits, EquipmentLayer } from "@/lib/avatar-traits"

interface ReadingAvatarProps {
  seed: string
  books: Book[]
  size?: number
}

// ── SVG sub-renderers ──

function renderHead(ch: CharacterTraits) {
  // Head shapes: 0=round, 1=tall oval, 2=slightly wide
  const rx = ch.headShape === 2 ? 42 : 38
  const ry = ch.headShape === 1 ? 44 : 38
  return (
    <ellipse
      cx={140}
      cy={115}
      rx={rx}
      ry={ry}
      fill={ch.skinTone}
      stroke="#2C2C2E"
      strokeWidth={2}
    />
  )
}

function renderEyes(ch: CharacterTraits) {
  const leftX = 126
  const rightX = 154
  const eyeY = 112

  switch (ch.eyeStyle) {
    case 0: // Round dots
      return (
        <g>
          <circle cx={leftX} cy={eyeY} r={4} fill={ch.eyeColor} />
          <circle cx={rightX} cy={eyeY} r={4} fill={ch.eyeColor} />
          <circle cx={leftX + 1.2} cy={eyeY - 1.2} r={1.5} fill="#fff" />
          <circle cx={rightX + 1.2} cy={eyeY - 1.2} r={1.5} fill="#fff" />
        </g>
      )
    case 1: // Wide eyes
      return (
        <g>
          <ellipse cx={leftX} cy={eyeY} rx={5} ry={4.5} fill="#fff" stroke="#2C2C2E" strokeWidth={1.2} />
          <ellipse cx={rightX} cy={eyeY} rx={5} ry={4.5} fill="#fff" stroke="#2C2C2E" strokeWidth={1.2} />
          <circle cx={leftX + 0.5} cy={eyeY + 0.5} r={3} fill={ch.eyeColor} />
          <circle cx={rightX + 0.5} cy={eyeY + 0.5} r={3} fill={ch.eyeColor} />
          <circle cx={leftX + 1.5} cy={eyeY - 0.5} r={1.2} fill="#fff" />
          <circle cx={rightX + 1.5} cy={eyeY - 0.5} r={1.2} fill="#fff" />
        </g>
      )
    case 2: // Happy closed
      return (
        <g>
          <path d={`M ${leftX - 4} ${eyeY} Q ${leftX} ${eyeY - 5} ${leftX + 4} ${eyeY}`} fill="none" stroke="#2C2C2E" strokeWidth={2} strokeLinecap="round" />
          <path d={`M ${rightX - 4} ${eyeY} Q ${rightX} ${eyeY - 5} ${rightX + 4} ${eyeY}`} fill="none" stroke="#2C2C2E" strokeWidth={2} strokeLinecap="round" />
        </g>
      )
    case 3: // Determined
    default:
      return (
        <g>
          <ellipse cx={leftX} cy={eyeY} rx={4.5} ry={3.5} fill="#fff" stroke="#2C2C2E" strokeWidth={1.2} />
          <ellipse cx={rightX} cy={eyeY} rx={4.5} ry={3.5} fill="#fff" stroke="#2C2C2E" strokeWidth={1.2} />
          <circle cx={leftX} cy={eyeY + 0.3} r={2.8} fill={ch.eyeColor} />
          <circle cx={rightX} cy={eyeY + 0.3} r={2.8} fill={ch.eyeColor} />
          <circle cx={leftX + 1} cy={eyeY - 0.5} r={1} fill="#fff" />
          <circle cx={rightX + 1} cy={eyeY - 0.5} r={1} fill="#fff" />
          {/* Slight brow lines */}
          <line x1={leftX - 5} y1={eyeY - 7} x2={leftX + 4} y2={eyeY - 6} stroke="#2C2C2E" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={rightX - 4} y1={eyeY - 6} x2={rightX + 5} y2={eyeY - 7} stroke="#2C2C2E" strokeWidth={1.5} strokeLinecap="round" />
        </g>
      )
  }
}

function renderMouth(ch: CharacterTraits) {
  const y = 126
  switch (ch.mouthStyle) {
    case 0: // Smile
      return <path d="M 132 126 Q 140 133 148 126" fill="none" stroke="#2C2C2E" strokeWidth={1.8} strokeLinecap="round" />
    case 1: // Small o
      return <ellipse cx={140} cy={y + 1} rx={3} ry={2.5} fill="#2C2C2E" opacity={0.6} />
    case 2: // Flat line with uptick
    default:
      return <path d="M 133 127 L 143 127 Q 146 127 147 125" fill="none" stroke="#2C2C2E" strokeWidth={1.5} strokeLinecap="round" />
  }
}

function renderHair(ch: CharacterTraits) {
  const color = ch.hairColor
  switch (ch.hairStyle) {
    case 0: // Short spiky
      return (
        <g>
          <ellipse cx={140} cy={85} rx={38} ry={16} fill={color} />
          <path d="M 108 92 Q 110 68 122 72 Q 118 60 130 66 Q 132 54 142 62 Q 148 52 155 64 Q 162 58 164 72 Q 172 68 172 92" fill={color} stroke="#2C2C2E" strokeWidth={1.5} />
        </g>
      )
    case 1: // Bowl cut
      return (
        <g>
          <path d="M 102 110 Q 100 78 140 72 Q 180 78 178 110 L 172 105 Q 170 82 140 78 Q 110 82 108 105 Z" fill={color} stroke="#2C2C2E" strokeWidth={1.5} />
        </g>
      )
    case 2: // Long flowing
      return (
        <g>
          <path d="M 102 115 Q 98 78 140 70 Q 182 78 178 115" fill={color} stroke="#2C2C2E" strokeWidth={1.5} />
          <path d="M 102 115 Q 95 140 98 170" fill={color} stroke="#2C2C2E" strokeWidth={1.2} />
          <path d="M 178 115 Q 185 140 182 170" fill={color} stroke="#2C2C2E" strokeWidth={1.2} />
        </g>
      )
    case 3: // Curly poof
      return (
        <g>
          <circle cx={120} cy={82} r={14} fill={color} stroke="#2C2C2E" strokeWidth={1.2} />
          <circle cx={140} cy={76} r={16} fill={color} stroke="#2C2C2E" strokeWidth={1.2} />
          <circle cx={160} cy={82} r={14} fill={color} stroke="#2C2C2E" strokeWidth={1.2} />
          <circle cx={112} cy={95} r={10} fill={color} stroke="#2C2C2E" strokeWidth={1} />
          <circle cx={168} cy={95} r={10} fill={color} stroke="#2C2C2E" strokeWidth={1} />
        </g>
      )
    case 4: // Side swept
    default:
      return (
        <g>
          <path d="M 105 108 Q 100 80 130 74 Q 145 72 158 76 Q 175 82 176 108" fill={color} stroke="#2C2C2E" strokeWidth={1.5} />
          <path d="M 105 108 Q 96 92 115 78 Q 120 74 130 74" fill={color} stroke="#2C2C2E" strokeWidth={1} />
        </g>
      )
  }
}

function renderBody(ch: CharacterTraits, hasCloakEquip: EquipmentLayer | undefined) {
  const bodyColor = hasCloakEquip ? hasCloakEquip.color : "#E8E0D0"
  return (
    <g>
      {/* Neck */}
      <rect x={133} y={148} width={14} height={10} rx={3} fill={ch.skinTone} />
      {/* Torso */}
      <path
        d="M 112 158 Q 112 155 118 155 L 162 155 Q 168 155 168 158 L 172 210 Q 172 218 164 218 L 116 218 Q 108 218 108 210 Z"
        fill={bodyColor}
        stroke="#2C2C2E"
        strokeWidth={1.8}
      />
      {/* Collar detail */}
      <path d="M 130 155 L 140 168 L 150 155" fill="none" stroke="#2C2C2E" strokeWidth={1.2} strokeLinecap="round" />
      {/* Arms */}
      <path d="M 112 162 Q 98 170 95 195 Q 94 200 98 200 Q 105 200 107 192 L 112 178" fill={bodyColor} stroke="#2C2C2E" strokeWidth={1.8} />
      <path d="M 168 162 Q 182 170 185 195 Q 186 200 182 200 Q 175 200 173 192 L 168 178" fill={bodyColor} stroke="#2C2C2E" strokeWidth={1.8} />
      {/* Hands */}
      <circle cx={98} cy={200} r={6} fill={ch.skinTone} stroke="#2C2C2E" strokeWidth={1.5} />
      <circle cx={182} cy={200} r={6} fill={ch.skinTone} stroke="#2C2C2E" strokeWidth={1.5} />
      {/* Legs */}
      <rect x={118} y={218} width={18} height={30} rx={6} fill="#4A4A5A" stroke="#2C2C2E" strokeWidth={1.5} />
      <rect x={144} y={218} width={18} height={30} rx={6} fill="#4A4A5A" stroke="#2C2C2E" strokeWidth={1.5} />
      {/* Shoes */}
      <ellipse cx={127} cy={250} rx={12} ry={5} fill="#3A3A3A" stroke="#2C2C2E" strokeWidth={1.2} />
      <ellipse cx={153} cy={250} rx={12} ry={5} fill="#3A3A3A" stroke="#2C2C2E" strokeWidth={1.2} />
    </g>
  )
}

// ── Equipment renderers (genre-specific gear) ──

function renderHatEquipment(equip: EquipmentLayer) {
  switch (equip.genre) {
    case "Fantasy": // Wizard hat
      return (
        <g className="avatar-equip" style={{ opacity: 0.7 + equip.intensity * 0.3 }}>
          <path
            d="M 108 88 L 140 30 L 172 88 Q 174 95 170 95 L 110 95 Q 106 95 108 88 Z"
            fill={equip.color}
            stroke="#2C2C2E"
            strokeWidth={1.8}
          />
          {/* Hat band */}
          <path d="M 108 90 Q 140 98 172 90" fill="none" stroke="#2C2C2E" strokeWidth={2} />
          {/* Star on hat */}
          <polygon
            points="140,45 143,53 151,53 145,58 147,66 140,62 133,66 135,58 129,53 137,53"
            fill="#FFF8E7"
            opacity={0.9}
          />
          {/* Brim */}
          <ellipse cx={140} cy={93} rx={46} ry={8} fill={equip.color} stroke="#2C2C2E" strokeWidth={1.5} />
        </g>
      )
    case "Mystery": // Detective hat
      return (
        <g className="avatar-equip" style={{ opacity: 0.7 + equip.intensity * 0.3 }}>
          <ellipse cx={140} cy={84} rx={44} ry={7} fill={equip.color} stroke="#2C2C2E" strokeWidth={1.5} />
          <path d="M 108 84 Q 108 62 140 58 Q 172 62 172 84" fill={equip.color} stroke="#2C2C2E" strokeWidth={1.8} />
          <path d="M 112 78 L 168 78" fill="none" stroke="#2C2C2E" strokeWidth={1.5} />
        </g>
      )
    case "Poetry": // Flower crown
      return (
        <g className="avatar-equip" style={{ opacity: 0.7 + equip.intensity * 0.3 }}>
          {[105, 118, 132, 148, 162, 175].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={80 + Math.sin(i * 1.2) * 3} r={6} fill={equip.color} opacity={0.8} />
              <circle cx={x} cy={80 + Math.sin(i * 1.2) * 3} r={2.5} fill="#FFF8E7" />
            </g>
          ))}
          <path d="M 105 82 Q 140 76 175 82" fill="none" stroke="#5A8A5A" strokeWidth={2} />
        </g>
      )
    default:
      return null
  }
}

function renderFaceEquipment(equip: EquipmentLayer) {
  switch (equip.genre) {
    case "Science Fiction": // Tech visor
      return (
        <g className="avatar-equip" style={{ opacity: 0.6 + equip.intensity * 0.4 }}>
          <rect x={115} y={106} width={50} height={12} rx={6} fill={equip.color} fillOpacity={0.6} stroke={equip.color} strokeWidth={1.5} />
          <line x1={118} y1={112} x2={162} y2={112} stroke="#fff" strokeWidth={0.8} opacity={0.5} />
          {/* Antenna */}
          <line x1={165} y1={108} x2={172} y2={96} stroke={equip.color} strokeWidth={1.5} />
          <circle cx={172} cy={95} r={2.5} fill={equip.color} />
        </g>
      )
    case "Thriller": // Scar
      return (
        <g className="avatar-equip" style={{ opacity: 0.5 + equip.intensity * 0.5 }}>
          <path d="M 156 104 L 162 112 L 158 120" fill="none" stroke={equip.color} strokeWidth={2} strokeLinecap="round" />
        </g>
      )
    default:
      return null
  }
}

function renderHeldEquipment(equip: EquipmentLayer) {
  switch (equip.genre) {
    case "Non-Fiction": // Tome / book
      return (
        <g className="avatar-equip" style={{ opacity: 0.7 + equip.intensity * 0.3 }}>
          <rect x={82} y={188} width={16} height={22} rx={2} fill={equip.color} stroke="#2C2C2E" strokeWidth={1.5} />
          <line x1={84} y1={192} x2={96} y2={192} stroke="#fff" strokeWidth={1} opacity={0.6} />
          <line x1={84} y1={196} x2={93} y2={196} stroke="#fff" strokeWidth={1} opacity={0.4} />
          {/* Spine */}
          <line x1={82} y1={188} x2={82} y2={210} stroke="#2C2C2E" strokeWidth={2} />
        </g>
      )
    case "Biography": // Quill
      return (
        <g className="avatar-equip" style={{ opacity: 0.7 + equip.intensity * 0.3 }}>
          <path d="M 185 185 L 192 170 Q 198 158 194 162 Q 190 166 186 180 Z" fill={equip.color} stroke="#2C2C2E" strokeWidth={1} />
          <line x1={185} y1={185} x2={183} y2={198} stroke="#8B6240" strokeWidth={1.5} strokeLinecap="round" />
        </g>
      )
    case "Other": // Scroll
      return (
        <g className="avatar-equip" style={{ opacity: 0.7 + equip.intensity * 0.3 }}>
          <rect x={83} y={190} width={14} height={18} rx={1} fill="#F5EADB" stroke="#2C2C2E" strokeWidth={1.2} />
          <circle cx={83} cy={190} r={3} fill="#F5EADB" stroke="#2C2C2E" strokeWidth={1} />
          <circle cx={83} cy={208} r={3} fill="#F5EADB" stroke="#2C2C2E" strokeWidth={1} />
          <line x1={86} y1={194} x2={94} y2={194} stroke="#B5B5B8" strokeWidth={0.8} />
          <line x1={86} y1={198} x2={92} y2={198} stroke="#B5B5B8" strokeWidth={0.8} />
          <line x1={86} y1={202} x2={93} y2={202} stroke="#B5B5B8" strokeWidth={0.8} />
        </g>
      )
    default:
      return null
  }
}

function renderCompanionEquipment(equip: EquipmentLayer) {
  switch (equip.genre) {
    case "Philosophy": // Owl
      return (
        <g className="avatar-equip" style={{ opacity: 0.7 + equip.intensity * 0.3 }} transform="translate(185, 148)">
          {/* Body */}
          <ellipse cx={0} cy={12} rx={10} ry={14} fill={equip.color} stroke="#2C2C2E" strokeWidth={1.5} />
          {/* Eyes */}
          <circle cx={-4} cy={6} r={4} fill="#FFF8E7" stroke="#2C2C2E" strokeWidth={1} />
          <circle cx={4} cy={6} r={4} fill="#FFF8E7" stroke="#2C2C2E" strokeWidth={1} />
          <circle cx={-4} cy={6} r={2} fill="#2C2C2E" />
          <circle cx={4} cy={6} r={2} fill="#2C2C2E" />
          {/* Beak */}
          <polygon points="0,9 -2,12 2,12" fill="#E8B86D" />
          {/* Ear tufts */}
          <path d="M -8 0 L -5 -6 L -2 2" fill={equip.color} stroke="#2C2C2E" strokeWidth={1} />
          <path d="M 8 0 L 5 -6 L 2 2" fill={equip.color} stroke="#2C2C2E" strokeWidth={1} />
        </g>
      )
    case "Romance": // Floating heart
      return (
        <g className="avatar-equip avatar-float" style={{ opacity: 0.7 + equip.intensity * 0.3 }}>
          <path
            d="M 185 135 C 185 128 176 125 176 132 C 176 138 185 145 185 145 C 185 145 194 138 194 132 C 194 125 185 128 185 135 Z"
            fill={equip.color}
            stroke="#2C2C2E"
            strokeWidth={1.2}
          />
        </g>
      )
    default:
      return null
  }
}

function renderAuraEquipment(equip: EquipmentLayer, level: number) {
  if (equip.genre !== "Self-Help") return null
  return (
    <g className="avatar-equip">
      <ellipse
        cx={140}
        cy={160}
        rx={65 + level * 2}
        ry={85 + level * 2}
        fill="none"
        stroke={equip.color}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.2 + equip.intensity * 0.3}
      />
      {/* Sparkles around aura */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const rx = 72 + level * 2
        const ry = 92 + level * 2
        const x = 140 + rx * Math.cos(rad)
        const y = 160 + ry * Math.sin(rad)
        return (
          <g key={i} opacity={0.3 + equip.intensity * 0.4}>
            <line x1={x - 3} y1={y} x2={x + 3} y2={y} stroke={equip.color} strokeWidth={1.2} />
            <line x1={x} y1={y - 3} x2={x} y2={y + 3} stroke={equip.color} strokeWidth={1.2} />
          </g>
        )
      })}
    </g>
  )
}

function renderCloakDetail(equip: EquipmentLayer) {
  if (equip.genre === "Fiction") {
    // Story cloak pattern: subtle swirl on torso
    return (
      <g className="avatar-equip" style={{ opacity: 0.3 + equip.intensity * 0.3 }}>
        <path d="M 125 168 Q 135 175 130 185 Q 125 195 135 200" fill="none" stroke="#FFF8E7" strokeWidth={1} />
        <path d="M 150 170 Q 155 180 148 188 Q 142 196 150 205" fill="none" stroke="#FFF8E7" strokeWidth={1} />
      </g>
    )
  }
  if (equip.genre === "History") {
    // Scholar robe: trim line
    return (
      <g className="avatar-equip" style={{ opacity: 0.3 + equip.intensity * 0.4 }}>
        <path d="M 112 160 L 112 218" fill="none" stroke="#2C2C2E" strokeWidth={1.5} />
        <path d="M 168 160 L 168 218" fill="none" stroke="#2C2C2E" strokeWidth={1.5} />
        <path d="M 112 185 L 168 185" fill="none" stroke="#2C2C2E" strokeWidth={1} strokeDasharray="4 3" />
      </g>
    )
  }
  return null
}

// ── Level badge ──

function renderLevelBadge(level: number, color: string) {
  if (level === 0) return null
  return (
    <g>
      <circle cx={196} cy={74} r={14} fill={color} stroke="#2C2C2E" strokeWidth={1.5} />
      <text
        x={196}
        y={78}
        textAnchor="middle"
        fontSize={level >= 10 ? 11 : 13}
        fontWeight="bold"
        fill="#fff"
        fontFamily="sans-serif"
      >
        {level}
      </text>
    </g>
  )
}

// ── Empty state character ──

function renderEmptyCharacter() {
  return (
    <g opacity={0.4} className="avatar-empty-pulse">
      {/* Simple silhouette */}
      <ellipse cx={140} cy={115} rx={36} ry={36} fill="#D4D0C8" stroke="#B5B5B8" strokeWidth={2} />
      <rect x={120} y={150} width={40} height={60} rx={10} fill="#D4D0C8" stroke="#B5B5B8" strokeWidth={2} />
      <text x={140} y={120} textAnchor="middle" fontSize={18} fill="#9B9B9E" fontFamily="sans-serif">?</text>
    </g>
  )
}

// ── Main component ──

export function ReadingAvatar({ seed, books, size = 280 }: ReadingAvatarProps) {
  const layers: CharacterLayers = useMemo(() => {
    const baseTraits = deriveBaseTraits(seed)
    return computeCharacterLayers(seed, baseTraits, books)
  }, [seed, books])

  const isEmpty = books.length === 0
  const ch = layers.character

  // Group equipment by slot for rendering order
  const hatEquip = layers.equipment.find(e => e.slot === "hat")
  const faceEquip = layers.equipment.find(e => e.slot === "face")
  const heldEquip = layers.equipment.find(e => e.slot === "held")
  const companionEquip = layers.equipment.find(e => e.slot === "companion")
  const auraEquip = layers.equipment.find(e => e.slot === "aura")
  const cloakEquip = layers.equipment.find(e => e.slot === "cloak")

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="avatar-container rounded-2xl"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 280 270"
          width={size}
          height={size}
          role="img"
          aria-label={
            isEmpty
              ? "Empty character avatar awaiting books"
              : `Level ${layers.level} reading character with ${books.length} book${books.length === 1 ? "" : "s"}`
          }
        >
          {/* Background */}
          <rect x={0} y={0} width={280} height={270} rx={16} fill="#F9F6F1" />

          {/* Subtle ground shadow */}
          <ellipse cx={140} cy={255} rx={50} ry={6} fill="#2C2C2E" opacity={0.06} />

          {isEmpty ? (
            renderEmptyCharacter()
          ) : (
            <g>
              {/* Aura (behind everything) */}
              {auraEquip && renderAuraEquipment(auraEquip, layers.level)}

              {/* Body + Cloak */}
              {renderBody(ch, cloakEquip)}
              {cloakEquip && renderCloakDetail(cloakEquip)}

              {/* Head */}
              {renderHead(ch)}

              {/* Hair (behind hat) */}
              {renderHair(ch)}

              {/* Eyes */}
              {renderEyes(ch)}

              {/* Mouth */}
              {renderMouth(ch)}

              {/* Cheek blush */}
              <ellipse cx={120} cy={122} rx={6} ry={3.5} fill="#F4A6D7" opacity={0.2} />
              <ellipse cx={160} cy={122} rx={6} ry={3.5} fill="#F4A6D7" opacity={0.2} />

              {/* Face equipment (visor, scar) */}
              {faceEquip && renderFaceEquipment(faceEquip)}

              {/* Hat */}
              {hatEquip && renderHatEquipment(hatEquip)}

              {/* Held items */}
              {heldEquip && renderHeldEquipment(heldEquip)}

              {/* Companions */}
              {companionEquip && renderCompanionEquipment(companionEquip)}

              {/* Level badge */}
              {renderLevelBadge(layers.level, layers.dominantColor)}
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
