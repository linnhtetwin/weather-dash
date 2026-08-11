import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sun } from 'lucide-react';
import { InfoTip } from './ui/InfoTip';

interface UVIndexWidgetProps {
  uvIndex: number;
}

export function UVIndexWidget({ uvIndex }: UVIndexWidgetProps) {
  let label = "Low";
  let colorClass = "bg-green-500";
  if (uvIndex >= 3 && uvIndex < 6) {
    label = "Moderate";
    colorClass = "bg-yellow-500";
  } else if (uvIndex >= 6 && uvIndex < 8) {
    label = "High";
    colorClass = "bg-orange-500";
  } else if (uvIndex >= 8 && uvIndex < 11) {
    label = "Very High";
    colorClass = "bg-red-500";
  } else if (uvIndex >= 11) {
    label = "Extreme";
    colorClass = "bg-purple-500";
  }

  const percentage = Math.min(100, (uvIndex / 15) * 100);

  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-slate-200">
          UV Index
          <InfoTip label="UV Index measures the strength of sunburn-producing ultraviolet radiation. Values 3 and above mean sun protection is recommended; 6 and above needs extra care." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mt-4">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-yellow-500/20" />
            <Sun className="w-16 h-16 text-yellow-500 fill-yellow-500 animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">UV Index</div>
            <div className="text-5xl font-bold text-white">{uvIndex.toFixed(1)}</div>
          </div>
        </div>
        
        <div className="mt-8 relative">
          <div className="h-6 w-full rounded-md bg-gradient-to-r from-green-400 via-yellow-400 to-purple-600 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
              {label}
            </div>
          </div>
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-full shadow-md transition-all duration-1000 border border-slate-200"
            style={{ left: `calc(${percentage}% - 3px)` }}
          />
        </div>
      </CardContent>
      <div className="p-4 bg-slate-800/50 rounded-b-2xl text-xs text-slate-400 border-t border-slate-700/50 mt-auto">
        ☀️ The present UV index is {Math.round(uvIndex)}, consider suggestions for the same!
      </div>
    </Card>
  );
}
