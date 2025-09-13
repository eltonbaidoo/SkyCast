interface TemperatureSliderProps {
  current: number
  min: number
  max: number
  unit: string
}

export function TemperatureSlider({ current, min, max, unit }: TemperatureSliderProps) {
  // Calculate the position of the current temperature on the slider (0-100%)
  const position = Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100))

  return (
    <div className="flex items-center gap-2 md:gap-3 mt-2">
      {/* Low temperature */}
      <div className="text-sm md:text-lg font-medium text-foreground/70 min-w-[2.5rem] md:min-w-[3rem]">
        {Math.round(min)}°
      </div>

      {/* Slider track */}
      <div
        className="flex-1 relative h-1.5 md:h-2 rounded-full overflow-hidden"
        style={{
          background: "linear-gradient(to right, #60a5fa 0%, #34d399 50%, #fbbf24 100%)",
        }}
      >
        {/* Current temperature indicator */}
        <div
          className="absolute top-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full border-2 border-gray-300 shadow-lg transform -translate-y-1/2 -translate-x-1/2 transition-all duration-300 z-10"
          style={{ left: `${position}%` }}
        />
      </div>

      {/* High temperature */}
      <div className="text-sm md:text-lg font-medium text-foreground/70 min-w-[2.5rem] md:min-w-[3rem] text-right">
        {Math.round(max)}°
      </div>
    </div>
  )
}
