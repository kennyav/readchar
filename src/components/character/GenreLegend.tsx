"use client"

import { useMemo } from "react"
import type { Book } from "@/types/reading"
import { computeGenreDistribution } from "@/lib/avatar-traits"

interface GenreLegendProps {
  books: Book[]
}

export function GenreLegend({ books }: GenreLegendProps) {
  const genres = useMemo(() => computeGenreDistribution(books), [books])

  if (genres.length === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {genres.map((g) => (
        <div
          key={g.genre}
          className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ backgroundColor: `${g.visual.color}18` }}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: g.visual.color }}
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-foreground/70">
            {g.genre}
          </span>
          <span className="text-[10px] text-foreground/40">
            {g.visual.label}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: g.visual.color }}
          >
            {g.count}
          </span>
        </div>
      ))}
    </div>
  )
}
