"use client"

export function CircularDecorations() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top left decoration */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-weather-blue/10 rounded-full blur-3xl"></div>

      {/* Top right decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-weather-teal/10 rounded-full blur-2xl"></div>

      {/* Bottom left decoration */}
      <div className="absolute -bottom-20 -left-10 w-36 h-36 bg-weather-cyan/10 rounded-full blur-3xl"></div>

      {/* Bottom right decoration */}
      <div className="absolute -bottom-10 -right-20 w-40 h-40 bg-weather-blue/10 rounded-full blur-2xl"></div>

      {/* Center decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-weather-blue/5 rounded-full blur-3xl opacity-50"></div>
    </div>
  )
}
