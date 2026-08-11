import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Gauge } from 'lucide-react';
import { InfoTip } from './ui/InfoTip';
import { formatPressure, type UnitSettings } from '../lib/units';

interface PressureWidgetProps {
  pressure: number;
  units: UnitSettings;
}

export function PressureWidget({ pressure, units }: PressureWidgetProps) {
  // Pressure ranges: Low < 1000, Normal 1000-1013, High > 1013
  let label = "Normal";
  let colorClass = "bg-green-500/20 text-green-400 border-green-500/30";
  let textColor = "text-green-400";
  
  if (pressure < 1000) {
    label = "Low";
    colorClass = "bg-blue-500/20 text-blue-400 border-blue-500/30";
    textColor = "text-blue-400";
  } else if (pressure > 1013) {
    label = "High";
    colorClass = "bg-purple-500/20 text-purple-400 border-purple-500/30";
    textColor = "text-purple-400";
  }

  // Calculate rotation for semi-circle gauge (950 to 1050 range)
  const minP = 950;
  const maxP = 1050;
  const percentage = Math.max(0, Math.min(100, ((pressure - minP) / (maxP - minP)) * 100));
  const rotation = -90 + (percentage * 1.8); // -90 to 90 degrees for a semi-circle

  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-slate-200">
          Pressure
          <InfoTip label="Atmospheric pressure is the weight of the air above you. Lower pressure often signals unsettled or rainy weather, while higher pressure usually means calmer, clearer conditions." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center py-4">
        
        {/* Semi-Circle Gauge */}
        <div className="relative w-48 h-24 overflow-hidden mb-2">
          {/* Background Arc */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-700/50 box-border" />
          
          {/* Colored Arc (SVG) */}
          <svg className="absolute top-0 left-0 w-48 h-48" viewBox="0 0 100 100">
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="url(#pressureGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              className="opacity-80"
            />
            <defs>
              <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Needle */}
          <div 
            className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-200 origin-bottom rounded-t-full transition-transform duration-1000 ease-out shadow-md"
            style={{ transform: `translate(-50%, 0) rotate(${rotation}deg)` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
          </div>
          
          {/* Center Hub */}
          <div className="absolute bottom-0 left-1/2 w-6 h-6 bg-slate-800 border-4 border-slate-600 rounded-full -translate-x-1/2 translate-y-1/2 z-10" />
        </div>

        <div className="flex flex-col items-center mt-4">
          <div className="text-4xl font-bold text-white flex items-baseline gap-1">
            {formatPressure(pressure, units.pressure)}
          </div>
          <div className={`mt-2 px-4 py-1 rounded-full text-sm font-medium border ${colorClass} flex items-center gap-1.5`}>
            <Gauge className="w-4 h-4" /> {label}
          </div>
        </div>

      </CardContent>
      <div className="p-4 bg-slate-800/50 rounded-b-2xl text-xs text-slate-400 border-t border-slate-700/50 mt-auto text-center">
        ⏲️ Current pressure level is {formatPressure(pressure, units.pressure)}.
      </div>
    </Card>
  );
}
