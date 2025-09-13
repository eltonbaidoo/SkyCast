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
    <div className="flex items-center gap-3 mt-2">
      {/* Low temperature */}
      <div className="text-lg font-medium text-foreground/70 min-w-[3rem]">{Math.round(min)}°</div>

      {/* Slider track */}
      <div className="flex-1 relative h-2 bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 rounded-full overflow-hidden">
        {/* Current temperature indicator */}
        <div
          className="absolute top-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-300 shadow-md transform -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
          style={{ left: `${position}%` }}
        />
      </div>

      {/* High temperature */}
      <div className="text-lg font-medium text-foreground/70 min-w-[3rem] text-right">{Math.round(max)}°</div>
    </div>
  )
}
