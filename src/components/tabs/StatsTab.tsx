import { AppData } from '@/hooks/use-app-data'
import { BookOpen, Clock, Sparkles } from 'lucide-react'
import React from 'react'

interface StatsTabProps {
   data: AppData,
   totalReadingHours: number,
   totalReadingMinutes: number
}

export default function StatsTab({data, totalReadingHours, totalReadingMinutes}: StatsTabProps) {
   return (
      <div>
         <h2 className="font-reading-heading text-xl text-[hsl(var(--reading-ink))] mb-4">
            Reading stats
         </h2>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="reading-card p-5 rounded-xl">
               <div className="text-2xl font-semibold tabular-nums text-[hsl(var(--reading-ink))]">
                  {data.character.totalBooksRead}
               </div>
               <div className="text-xs text-[hsl(var(--reading-ink-muted))] mt-1">Books read</div>
               <BookOpen className="w-5 h-5 text-[hsl(var(--reading-accent))] mt-3 opacity-80" />
            </div>
            <div className="reading-card p-5 rounded-xl">
               <div className="text-2xl font-semibold tabular-nums text-[hsl(var(--reading-ink))]">
                  {totalReadingHours}h {totalReadingMinutes}m
               </div>
               <div className="text-xs text-[hsl(var(--reading-ink-muted))] mt-1">Reading time</div>
               <Clock className="w-5 h-5 text-[hsl(var(--reading-accent))] mt-3 opacity-80" />
            </div>
            <div className="reading-card p-5 rounded-xl">
               <div className="text-2xl font-semibold tabular-nums text-[hsl(var(--reading-ink))]">
                  {data.character.currentLevel}
               </div>
               <div className="text-xs text-[hsl(var(--reading-ink-muted))] mt-1">Companion level</div>
               <Sparkles className="w-5 h-5 text-[hsl(var(--reading-accent))] mt-3 opacity-80" />
            </div>
         </div>

         <div className="reading-card p-6 rounded-xl">
            <h3 className="text-sm font-semibold text-[hsl(var(--reading-ink-muted))] uppercase tracking-wide mb-4">
               Attribute levels
            </h3>
            <div className="space-y-4">
               {Object.values(data.character.attributes).map((attr) => (
                  <div key={attr.name}>
                     <div className="flex justify-between mb-1.5">
                        <span className="capitalize font-medium text-[hsl(var(--reading-ink))] flex items-center gap-2">
                           <span>{attr.icon}</span>
                           {attr.name}
                        </span>
                        <span className="text-sm font-mono text-[hsl(var(--reading-ink-muted))]">
                           Level {attr.level} — {attr.value}/{attr.maxValue}
                        </span>
                     </div>
                     <div className="h-2 bg-[hsl(var(--reading-border))] rounded-full overflow-hidden">
                        <div
                           className="h-full rounded-full transition-all"
                           style={{
                              width: `${(attr.value / attr.maxValue) * 100}%`,
                              backgroundColor: attr.color,
                           }}
                        />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
}
