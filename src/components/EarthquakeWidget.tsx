import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity, MapPin, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { formatRadius, type UnitSettings } from '../lib/units';

interface EarthquakeWidgetProps {
  earthquakes: any[];
  onRadiusChange: (radius: number) => void;
  currentRadius: number;
  units: UnitSettings;
}

export function EarthquakeWidget({ earthquakes, onRadiusChange, currentRadius, units }: EarthquakeWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [minMag, setMinMag] = useState(2.5);

  const filteredEarthquakes = earthquakes.filter(eq => (eq.properties.mag || 0) >= minMag);

  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-2 border-b border-slate-700/50 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Activity className="w-5 h-5 text-red-400 animate-pulse" />
          Recent Earthquakes
        </CardTitle>
        <button onClick={() => setShowSettings(!showSettings)} className="text-slate-400 hover:text-slate-200">
          <Settings className="w-4 h-4" />
        </button>
      </CardHeader>
      {showSettings && (
        <div className="p-4 bg-slate-800 border-b border-slate-700 space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-2">Radius: {formatRadius(currentRadius, units.distance)}</label>
            <input 
              type="range" 
              min="100" 
              max="5000" 
              step="100" 
              value={currentRadius} 
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Min Magnitude: {minMag.toFixed(1)}</label>
            <input 
              type="range" 
              min="0" 
              max="9" 
              step="0.1" 
              value={minMag} 
              onChange={(e) => setMinMag(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}
      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide max-h-[400px]">
        {filteredEarthquakes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
            <Activity className="w-12 h-12 mb-2 opacity-20" />
            <p>No significant earthquakes recorded nearby in the last 7 days.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredEarthquakes.map((eq) => {
              const mag = eq.properties.mag || 0;
              let colorClass = "text-green-400 bg-green-400/10 border-green-400/20";
              if (mag >= 4) colorClass = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
              if (mag >= 5) colorClass = "text-orange-400 bg-orange-400/10 border-orange-400/20";
              if (mag >= 6) colorClass = "text-red-400 bg-red-400/10 border-red-400/20";

              return (
                <div key={eq.id} className="p-4 hover:bg-slate-800/80 transition-colors flex items-center gap-4 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform ${colorClass}`}>
                    {mag.toFixed(1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors" title={eq.properties.place}>
                      {eq.properties.place}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {format(new Date(eq.properties.time), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
