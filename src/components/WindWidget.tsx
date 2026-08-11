import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wind, Navigation, Leaf } from 'lucide-react';
import { InfoTip } from './ui/InfoTip';
import { formatSpeed, type UnitSettings } from '../lib/units';

interface WindWidgetProps {
  speed: number;
  gusts: number;
  direction: number;
  units: UnitSettings;
}

const WindAnimation = ({ speed, direction, units }: { speed: number, direction: number, units: UnitSettings }) => {
  // Speed determines animation duration (faster wind = shorter duration)
  const duration = Math.max(0.5, 3 - (speed / 20)); 
  
  // Color based on speed
  const getSpeedColor = (s: number) => {
    if (s < 15) return 'from-blue-500/0 via-blue-400/60 to-blue-500/0';
    if (s < 30) return 'from-emerald-500/0 via-emerald-400/60 to-emerald-500/0';
    if (s < 50) return 'from-amber-500/0 via-amber-400/60 to-amber-500/0';
    return 'from-rose-500/0 via-rose-400/60 to-rose-500/0';
  };

  const getRingColor = (s: number) => {
    if (s < 15) return 'border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]';
    if (s < 30) return 'border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.2)]';
    if (s < 50) return 'border-amber-500/30 shadow-[0_0_30px_rgba(251,191,36,0.2)]';
    return 'border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.2)]';
  };

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-2xl bg-slate-900/50 flex items-center justify-center border border-slate-700/50 group">
      <style>
        {`
          @keyframes wind-particle {
            0% { transform: translateX(-150px) scaleX(1); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(250px) scaleX(2); opacity: 0; }
          }
        `}
      </style>
      
      {/* Wind lines (particles) - Background */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-1000"
        style={{ transform: `rotate(${direction + 90}deg)` }}
      >
        <div className="relative w-[200%] h-[200%]">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute h-[2px] rounded-full bg-gradient-to-r ${getSpeedColor(speed)}`}
              style={{
                width: `${Math.random() * 60 + 20}px`,
                left: '20%',
                top: `${Math.random() * 100}%`,
                animation: `wind-particle ${duration + Math.random()}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* Compass Dial */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-44 h-44 opacity-60">
          {/* Outer dashed ring */}
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className="text-slate-500" />
          
          {/* Tick marks */}
          {[...Array(72)].map((_, i) => {
            const angle = i * 5;
            const isMajor = i % 9 === 0; // Every 45 degrees
            const isMedium = i % 3 === 0; // Every 15 degrees
            const length = isMajor ? 6 : isMedium ? 4 : 2;
            const width = isMajor ? 2 : 1;
            const opacity = isMajor ? 1 : isMedium ? 0.6 : 0.3;
            
            return (
              <line
                key={i}
                x1="100"
                y1={12 - length}
                x2="100"
                y2="12"
                stroke="currentColor"
                strokeWidth={width}
                strokeOpacity={opacity}
                transform={`rotate(${angle} 100 100)`}
                className="text-slate-400"
              />
            );
          })}
          
          {/* Cardinal Directions */}
          <text x="100" y="26" textAnchor="middle" fill="currentColor" className="text-[12px] font-bold text-slate-200" transform="rotate(0 100 100)">N</text>
          <text x="100" y="26" textAnchor="middle" fill="currentColor" className="text-[12px] font-bold text-slate-200" transform="rotate(90 100 100)">E</text>
          <text x="100" y="26" textAnchor="middle" fill="currentColor" className="text-[12px] font-bold text-slate-200" transform="rotate(180 100 100)">S</text>
          <text x="100" y="26" textAnchor="middle" fill="currentColor" className="text-[12px] font-bold text-slate-200" transform="rotate(270 100 100)">W</text>
        </svg>
      </div>
      
      {/* Center Display */}
      <div 
        className={`relative z-10 w-28 h-28 rounded-full border-4 flex items-center justify-center bg-slate-900/80 backdrop-blur-xl transition-all duration-500 ${getRingColor(speed)}`}
      >
        {/* Needle */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${direction}deg)` }}
        >
          <div className="relative flex flex-col items-center h-full py-2">
            {/* Top pointer */}
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[30px] border-b-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]" />
            {/* Center dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md z-10 -my-1" />
            {/* Bottom tail */}
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[30px] border-t-slate-400" />
          </div>
        </div>

        {/* Speed Text */}
        <div className="text-center z-10 bg-slate-900/60 w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-sm border border-slate-700/50">
          <div className="text-2xl font-bold text-white tracking-tighter leading-none">{formatSpeed(speed, units.speed).split(' ')[0]}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">{formatSpeed(speed, units.speed).split(' ')[1]}</div>
        </div>
      </div>
    </div>
  );
};

export function WindWidget({ speed, gusts, direction, units }: WindWidgetProps) {
  let description = "Calm";
  if (speed > 5) description = "Light breeze";
  if (speed > 11) description = "Moderate breeze";
  if (speed > 28) description = "Strong breeze";
  if (speed > 49) description = "Gale";
  if (speed > 74) description = "Storm";

  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-slate-700/50">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Wind className="w-5 h-5 text-blue-400" />
            Wind Status
            <InfoTip label="Wind status shows current wind speed, stronger gusts, and the direction the wind is coming from. Higher speeds can affect comfort, travel, and outdoor plans." />
          </CardTitle>
          <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
            🍃 {description}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 sm:p-5 gap-4 justify-between">
        <WindAnimation speed={speed} direction={direction} units={units} />

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="text-sm text-slate-400 mb-2 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-orange-400" /> Gust Speed
            </div>
            <div className="text-2xl font-semibold text-white">
              {formatSpeed(gusts, units.speed)}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="text-sm text-slate-400 mb-2 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-400" /> Direction
            </div>
            <div className="text-2xl font-semibold text-white">
              {direction}&deg; <span className="text-sm font-normal text-slate-400">
                {getDirectionString(direction)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getDirectionString(degrees: number): string {
  const val = Math.floor((degrees / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
}
