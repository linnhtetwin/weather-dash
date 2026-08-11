import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import { InfoTip } from './ui/InfoTip';
import { formatPrecipitation, type UnitSettings } from '../lib/units';

interface PrecipitationWidgetProps {
  precipitation: number;
  weatherCode: number;
  units: UnitSettings;
}

export function PrecipitationWidget({ precipitation, weatherCode, units }: PrecipitationWidgetProps) {
  // Determine icon based on weather code
  let Icon = CloudRain;
  if (weatherCode >= 71 && weatherCode <= 77) Icon = CloudSnow;
  if (weatherCode >= 95) Icon = CloudLightning;

  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-slate-200">
          Precipitation
          <InfoTip label="Precipitation is the amount of rain, drizzle, snow, or storm water measured at the current time. Higher millimeters mean wetter conditions." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between py-6">
          <div className="relative">
            <Icon className="w-20 h-20 text-blue-400 fill-blue-400/20" strokeWidth={1.5} />
            {precipitation > 0 && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-1.5 h-3 bg-blue-500 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-3 bg-blue-500 rounded-full animate-bounce delay-150" />
                <div className="w-1.5 h-3 bg-blue-500 rounded-full animate-bounce delay-300" />
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white">
              {formatPrecipitation(precipitation, units.precipitation)}
            </div>
          </div>
        </div>
      </CardContent>
      <div className="p-4 bg-slate-800/50 rounded-b-2xl text-xs text-slate-400 border-t border-slate-700/50 mt-auto">
        ☔ Current precipitation sits at {formatPrecipitation(precipitation, units.precipitation)}
      </div>
    </Card>
  );
}
