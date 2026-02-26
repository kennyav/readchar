import React from 'react'
import { AttributeConstellation } from '../character/AttributeConstellation'
import { TrendingUp } from 'lucide-react'
import { AttributeType, Genre } from '@/types/reading'
import { AppData } from '@/hooks/use-app-data'

interface CompanionProps {
   recommendations: Genre[],
   data: AppData,
   setSelectedAttribute: (attribute: AttributeType) => void
}
export default function CompanionTab({recommendations, data, setSelectedAttribute}: CompanionProps) {
   return (
      <div className="">
         <div className="reading-card p-6 rounded-xl min-h-[280px]">
            <h2 className="text-sm font-semibold text-[hsl(var(--reading-ink-muted))] uppercase tracking-wide mb-4">
               What they're growing
            </h2>
            <AttributeConstellation character={data.character} onAttributeClick={setSelectedAttribute} />
         </div>

         {recommendations.length > 0 && (
            <div className="reading-card-soft p-5 rounded-xl">
               <h3 className="text-sm font-semibold text-[hsl(var(--reading-ink))] mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[hsl(var(--reading-accent))]" />
                  Try these for balance
               </h3>
               <p className="text-[hsl(var(--reading-ink-muted))] text-sm mb-3">
                  These genres can strengthen your companion’s weaker traits.
               </p>
               <div className="flex flex-wrap gap-2">
                  {recommendations.map((genre) => (
                     <span
                        key={genre}
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-[hsl(var(--reading-accent-soft))] text-[hsl(var(--reading-ink))]"
                     >
                        {genre}
                     </span>
                  ))}
               </div>
            </div>
         )}
      </div>
   )
}
