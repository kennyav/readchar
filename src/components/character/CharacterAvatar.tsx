import { motion } from 'framer-motion';
import { CharacterState } from '@/types/reading';

interface CharacterAvatarProps {
  character: CharacterState;
  className?: string;
}

export function CharacterAvatar({ character, className = '' }: CharacterAvatarProps) {
  const { visualTraits, currentLevel } = character;
  
  const getAuraEffect = () => {
    switch (visualTraits.aura) {
      case 'soft-glow':
        return 'drop-shadow-[0_0_25px_rgba(232,184,109,0.4)]';
      case 'radiant':
        return 'drop-shadow-[0_0_25px_rgba(232,184,109,0.6)]';
      case 'ethereal':
        return 'drop-shadow-[0_0_35px_rgba(155,126,189,0.8)]';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Main character body */}
      <div
        className={`relative w-48 h-48 rounded-full ${getAuraEffect()}`}
        style={{
          background: visualTraits.baseColor,
          boxShadow: `
            -6px -6px 12px rgba(255, 255, 255, 0.8),
            6px 6px 12px rgba(0, 0, 0, 0.1),
            inset -2px -2px 8px rgba(255, 255, 255, 0.5),
            inset 2px 2px 8px rgba(0, 0, 0, 0.05)
          `,
        }}
      >
        {/* Eyes */}
        <div className="absolute top-16 left-12 w-4 h-4 bg-[#2C2C2E] rounded-full" />
        <div className="absolute top-16 right-12 w-4 h-4 bg-[#2C2C2E] rounded-full" />
        
        {/* Smile - filled crescent */}
        <svg
          className="absolute bottom-16 left-1/2 -translate-x-1/2 w-12 h-6"
          viewBox="0 0 48 24"
          fill="none"
        >
          <path
            d="M 4 20 Q 24 4 44 20 L 4 20 Z"
            fill="rgba(44, 44, 46, 0.9)"
          />
        </svg>

        {/* Level indicator - RPG style */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg text-sm font-mono font-bold text-white border-2 border-amber-800/60"
          style={{
            background: 'linear-gradient(180deg, #E8B86D 0%, #c99a3d 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 0 rgba(0,0,0,0.2)',
          }}
        >
          LV {currentLevel}
        </div>
      </div>
      
      {/* Accessories */}
      {visualTraits.accessories.includes('hat') && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl">
          🎩
        </div>
      )}
      {visualTraits.accessories.includes('glasses') && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 text-3xl">
          👓
        </div>
      )}
      {visualTraits.accessories.includes('book') && (
        <div className="absolute bottom-0 -right-6 text-3xl">
          📚
        </div>
      )}
    </motion.div>
  );
}
