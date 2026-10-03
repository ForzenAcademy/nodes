"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type SmoothProgressProps = Omit<
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  "value"
> & {
  value?: number | null
  active: boolean
  cycleDuration: number
  maxExtrapolation?: number
}

type SmoothProgressEntry = {
  indicator: HTMLDivElement
  value: number
  active: boolean
  cycleDuration: number
  maxExtrapolation: number
  anchorTime: number
  displayValue: number
  resetStartedAt: number | null
  resetFrom: number
}

const RESET_DURATION = 200
const entries = new Set<SmoothProgressEntry>()
let animationFrame: number | null = null

const clampProgress = (value: number) => Math.min(100, Math.max(0, value))

const expectedProgress = (entry: SmoothProgressEntry, now: number) => {
  if (!entry.active || entry.cycleDuration <= 0) return entry.value
  const elapsed = Math.min(
    Math.max(0, now - entry.anchorTime),
    entry.maxExtrapolation,
  )
  return clampProgress(entry.value + (elapsed / entry.cycleDuration) * 100)
}

const paintEntry = (entry: SmoothProgressEntry, now: number) => {
  const expected = expectedProgress(entry, now)
  if (entry.resetStartedAt !== null) {
    const resetElapsed = now - entry.resetStartedAt
    const resetProgress = Math.min(1, Math.max(0, resetElapsed / RESET_DURATION))
    const eased = 1 - Math.pow(1 - resetProgress, 3)
    entry.displayValue = entry.resetFrom + (expected - entry.resetFrom) * eased
    if (resetProgress >= 1) entry.resetStartedAt = null
  } else {
    entry.displayValue = expected
  }
  entry.indicator.style.transform = `translateX(-${100 - clampProgress(entry.displayValue)}%)`
}

const runAnimationFrame = (now: number) => {
  animationFrame = null
  let shouldContinue = false
  entries.forEach((entry) => {
    const isAnimating =
      entry.resetStartedAt !== null ||
      (entry.active && now - entry.anchorTime < entry.maxExtrapolation)
    if (!isAnimating) return
    paintEntry(entry, now)
    shouldContinue = true
  })
  if (shouldContinue) animationFrame = window.requestAnimationFrame(runAnimationFrame)
}

const scheduleAnimation = () => {
  if (animationFrame === null) {
    animationFrame = window.requestAnimationFrame(runAnimationFrame)
  }
}

function SmoothProgress({
  className,
  value,
  active,
  cycleDuration,
  maxExtrapolation = 350,
  ...props
}: SmoothProgressProps) {
  const indicatorRef = React.useRef<HTMLDivElement>(null)
  const entryRef = React.useRef<SmoothProgressEntry | null>(null)
  const normalizedValue = clampProgress(value ?? 0)

  React.useLayoutEffect(() => {
    const indicator = indicatorRef.current
    if (!indicator) return
    const now = performance.now()
    const entry: SmoothProgressEntry = {
      indicator,
      value: 0,
      active: false,
      cycleDuration: 1,
      maxExtrapolation: 0,
      anchorTime: now,
      displayValue: 0,
      resetStartedAt: null,
      resetFrom: 0,
    }
    entryRef.current = entry
    entries.add(entry)
    paintEntry(entry, now)
    return () => {
      entries.delete(entry)
      entryRef.current = null
      if (entries.size === 0 && animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = null
      }
    }
  }, [])

  React.useLayoutEffect(() => {
    const entry = entryRef.current
    if (!entry) return
    const now = performance.now()
    const previousValue = entry.value
    const previousDisplay = entry.displayValue

    entry.value = normalizedValue
    entry.active = active
    entry.cycleDuration = cycleDuration
    entry.maxExtrapolation = maxExtrapolation
    entry.anchorTime = now

    if (normalizedValue + 0.5 < previousValue) {
      entry.resetStartedAt = now
      entry.resetFrom = Math.max(previousDisplay, previousValue)
    }

    paintEntry(entry, now)
    if (active || entry.resetStartedAt !== null) scheduleAnimation()
  }, [active, cycleDuration, maxExtrapolation, normalizedValue])

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={normalizedValue}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20 smooth-progress",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        ref={indicatorRef}
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary"
        style={{ transform: "translateX(-100%)" }}
      />
    </ProgressPrimitive.Root>
  )
}

export { SmoothProgress }
