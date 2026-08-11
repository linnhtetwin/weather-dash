import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wind } from 'lucide-react';
import { InfoTip } from './ui/InfoTip';

interface AQIWidgetProps {
  aqi: number;
}

export function AQIWidget({ aqi }: AQIWidgetProps) {
  // Clamp AQI between 0 and 100
  const clampedAqi = Math.min(Math.max(aqi, 0), 100);
  // Map 0-100 to 0-180 degrees
  const angle = (clampedAqi / 100) * 180;

  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-200 text-sm md:text-base">
          <Wind className="w-4 h-4 text-blue-400" />
          Air Quality Index
          <InfoTip label="Air Quality Index summarizes how polluted the air is. Lower values are cleaner; higher values may affect sensitive groups and outdoor activity planning." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[200px] relative">
          <svg viewBox="0 0 200 110" className="w-full h-auto">
            <defs>
              <linearGradient id="aqiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="25%" stopColor="#84cc16" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="75%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {/* Background Arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
            {/* Colored Arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#aqiGradient)" strokeWidth="20" strokeLinecap="round" />
            {/* Needle */}
            <line 
              x1="100" y1="100" x2="100" y2="30" 
              stroke="white" 
              strokeWidth="4" 
              strokeLinecap="round" 
              className="transition-transform duration-1000 ease-out"
              style={{ transformOrigin: '100px 100px', transform: `rotate(${angle - 90}deg)` }} 
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <div className="text-3xl font-bold text-white">{aqi}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AQI</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
