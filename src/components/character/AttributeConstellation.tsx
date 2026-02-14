import { motion } from 'framer-motion';
import { AttributeType } from '@/types/reading';
import { CharacterState } from '@/types/reading';

interface AttributeConstellationProps {
  character: CharacterState;
  onAttributeClick?: (attribute: AttributeType) => void;
}

export function AttributeConstellation({ character, onAttributeClick }: AttributeConstellationProps) {
  const attributes = Object.values(character.attributes);
  const angleStep = (2 * Math.PI) / attributes.length;
  const radius = 140;

  return (
    <div className="grid grid-cols-1 grid-flow-row gap-4">
      {attributes.map((attr) => {
        const items = Array.from({ length: attr.maxValue });
        return (
        <div key={attr.name} className="game-panel p-4 rounded-2xl">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-[#2C2C2E]">{attr.name}</div>
            <div className=" flex flex-coltext-sm text-[#6C6C70]">{attr.value}/{attr.maxValue}
              {items.map((item, index) => (
                <div key={index} className="w-1 h-1 bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
        )})}
    </div>
    // <div className="relative w-full h-full flex items-center justify-center">
    //   {/* Connection lines */}
    //   <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
    //     <defs>
    //       <filter id="glow">
    //         <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
    //         <feMerge>
    //           <feMergeNode in="coloredBlur"/>
    //           <feMergeNode in="SourceGraphic"/>
    //         </feMerge>
    //       </filter>
    //     </defs>
    //     {attributes.map((attr, index) => {
    //       const x1 = '50%';
    //       const y1 = '50%';
    //       const angle = index * angleStep - Math.PI / 2;
    //       const x2 = `calc(50% + ${radius * Math.cos(angle)}px)`;
    //       const y2 = `calc(50% + ${radius * Math.sin(angle)}px)`;
          
    //       return (
    //         <line
    //           key={attr.name}
    //           x1={x1}
    //           y1={y1}
    //           x2={x2}
    //           y2={y2}
    //           stroke={attr.color}
    //           strokeWidth="2"
    //           opacity="0.3"
    //           filter="url(#glow)"
    //         />
    //       );
    //     })}
    //   </svg>

    //   {/* Attribute nodes */}
    //   {attributes.map((attr, index) => {
    //     const angle = index * angleStep - Math.PI / 2;
    //     const x = radius * Math.cos(angle);
    //     const y = radius * Math.sin(angle);
    //     const percentage = (attr.value / attr.maxValue) * 100;

    //     return (
    //       <button
    //         key={attr.name}
    //         className="absolute"
    //         style={{
    //           left: '50%',
    //           top: '50%',
    //           transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    //         }}
    //         onClick={() => onAttributeClick?.(attr.name)}
    //       >
    //         <motion.div
    //           className="flex flex-col items-center"
    //           whileHover={{ scale: 1.1 }}
    //           whileTap={{ scale: 0.95 }}
    //         >
    //         <div className="relative w-20 h-20">
    //           {/* Progress ring background */}
    //           <svg className="absolute inset-0 w-full h-full -rotate-90">
    //             <circle
    //               cx="40"
    //               cy="40"
    //               r="36"
    //               fill="none"
    //               stroke="rgba(0,0,0,0.1)"
    //               strokeWidth="4"
    //             />
    //             <circle
    //               cx="40"
    //               cy="40"
    //               r="36"
    //               fill="none"
    //               stroke={attr.color}
    //               strokeWidth="4"
    //               strokeDasharray={`${2 * Math.PI * 36}`}
    //               strokeDashoffset={`${2 * Math.PI * 36 * (1 - percentage / 100)}`}
    //               strokeLinecap="round"
    //               filter="url(#glow)"
    //             />
    //           </svg>
              
    //           {/* Inner circle with icon */}
    //           <div
    //             className="absolute inset-2 rounded-full flex items-center justify-center text-2xl"
    //             style={{
    //               background: '#F9F6F1',
    //               boxShadow: `
    //                 -3px -3px 6px rgba(255, 255, 255, 0.8),
    //                 3px 3px 6px rgba(0, 0, 0, 0.1),
    //                 inset 1px 1px 3px rgba(0, 0, 0, 0.05)
    //               `,
    //             }}
    //           >
    //             {attr.icon}
    //           </div>
              
    //           {/* Level badge - game style */}
    //           <div
    //             className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-xs font-mono font-bold text-white border border-black/20"
    //             style={{
    //               backgroundColor: attr.color,
    //               boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.2)',
    //             }}
    //           >
    //             {attr.level}
    //           </div>
    //         </div>
            
    //         {/* Attribute name */}
    //         <div className="mt-2 text-xs font-medium text-[#2C2C2E] capitalize text-center mb-1.5">
    //           {attr.name}
    //         </div>
            
    //         {/* Progress bar - game style */}
    //         <div 
    //           className="w-24 h-3 rounded-sm border-2 overflow-hidden relative"
    //           style={{
    //             background: 'rgba(0, 0, 0, 0.2)',
    //             borderColor: 'rgba(0, 0, 0, 0.3)',
    //             boxShadow: `
    //               inset 0 1px 2px rgba(0, 0, 0, 0.3),
    //               0 1px 0 rgba(255, 255, 255, 0.1)
    //             `,
    //           }}
    //         >
    //           {/* Progress fill */}
    //           <motion.div
    //             className="h-full rounded-sm relative"
    //             style={{
    //               width: `${percentage}%`,
    //               background: `linear-gradient(90deg, ${attr.color} 0%, ${attr.color}dd 50%, ${attr.color} 100%)`,
    //               boxShadow: `
    //                 inset 0 1px 0 rgba(255, 255, 255, 0.4),
    //                 0 0 6px ${attr.color}90,
    //                 inset 0 -1px 0 rgba(0, 0, 0, 0.2)
    //               `,
    //             }}
    //             initial={{ width: 0 }}
    //             animate={{ width: `${percentage}%` }}
    //             transition={{ duration: 0.8, ease: 'easeOut' }}
    //           >
    //             {/* Shine effect */}
    //             <div
    //               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
    //             />
    //           </motion.div>
              
    //           {/* Value text overlay */}
    //           <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none">
    //             {attr.value}/{attr.maxValue}
    //           </div>
    //         </div>
    //         </motion.div>
    //       </button>
    //     );
    //   })}
    // </div>
  );
}
