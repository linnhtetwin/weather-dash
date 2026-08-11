import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Cloud } from 'lucide-react';
import { InfoTip } from './ui/InfoTip';
import { formatDistance, type UnitSettings } from '../lib/units';

interface CloudVisibilityWidgetProps {
  cloudCover: number;
  visibility: number;
  units: UnitSettings;
}

export function CloudVisibilityWidget({ cloudCover, visibility, units }: CloudVisibilityWidgetProps) {
  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-center py-8 relative w-full h-32 overflow-hidden rounded-xl bg-slate-900/50 border border-slate-700/30">
          {/* Simple cloud animation */}
          <div className="absolute top-4 left-4 animate-[bounce_8s_ease-in-out_infinite]">
            <Cloud className="w-16 h-16 text-white/80 fill-white/80" />
          </div>
          <div className="absolute top-8 right-8 animate-[bounce_10s_ease-in-out_infinite_reverse]">
            <Cloud className="w-12 h-12 text-white/60 fill-white/60" />
          </div>
          <div className="absolute top-12 left-1/2 animate-[bounce_12s_ease-in-out_infinite]">
            <Cloud className="w-10 h-10 text-white/40 fill-white/40" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <CardTitle className="mb-2 flex items-center gap-1.5 text-slate-200">
              Cloud Cover
              <InfoTip label="Cloud cover is the percentage of sky covered by clouds. Higher values usually mean less direct sunlight and a greater chance of overcast conditions." />
            </CardTitle>
            <div className="text-3xl font-bold text-white">
              {cloudCover} <span className="text-sm font-normal text-slate-400">%</span>
            </div>
          </div>
          <div>
            <CardTitle className="mb-2 flex items-center gap-1.5 text-slate-200">
              Visibility
              <InfoTip label="Visibility estimates how far you can clearly see. Low visibility can be caused by rain, fog, haze, smoke, or heavy cloud conditions." />
            </CardTitle>
            <div className="text-3xl font-bold text-white">
              {formatDistance(visibility, units.distance)}
            </div>
          </div>
        </div>
      </CardContent>
      <div className="p-4 bg-slate-800/50 rounded-b-2xl text-xs text-slate-400 border-t border-slate-700/50 mt-auto">
        ☁️ Recent visibility is {formatDistance(visibility, units.distance)} with {cloudCover}% cloud coverage, so plan accordingly!
      </div>
    </Card>
  );
}
