import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Droplets, Thermometer, Sun, Gauge } from 'lucide-react';
import { InfoTip } from './ui/InfoTip';
import { formatTemperature, type UnitSettings } from '../lib/units';

interface ComfortWidgetProps {
  apparentTemperature: number;
  humidity: number;
  uvIndex: number;
  units: UnitSettings;
}

export function ComfortWidget({ apparentTemperature, humidity, uvIndex, units }: ComfortWidgetProps) {
  const comfortLabel = humidity > 80 ? 'Humid' : humidity < 35 ? 'Dry' : 'Comfortable';
  const heatNote = apparentTemperature >= 32 ? 'Heat caution' : apparentTemperature <= 18 ? 'Cool feel' : 'Feels steady';
  const uvNote = uvIndex >= 6 ? 'High UV' : uvIndex >= 3 ? 'Moderate UV' : 'Low UV';

  return (
    <Card className="flex h-full flex-col bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Gauge className="w-4 h-4 text-blue-400" />
          Comfort
          <InfoTip label="Comfort combines feels-like temperature, humidity, and UV context to help you judge how conditions may feel outdoors beyond the raw air temperature." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 sm:p-5 pt-2">
        <div className="grid h-full gap-3">
          <div className="rounded-xl border border-slate-700/40 bg-slate-950/20 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Thermometer className="h-4 w-4 text-orange-400" />
              Feels Like
            </div>
            <div className="mt-1 text-3xl font-bold text-white">
              {formatTemperature(apparentTemperature, units.temperature)}
            </div>
            <div className="mt-1 text-sm text-slate-400">{heatNote}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-700/40 bg-slate-950/20 p-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Droplets className="h-4 w-4 text-blue-400" />
                Humidity
              </div>
              <div className="mt-1 text-xl font-semibold text-white">{Math.round(humidity)}%</div>
              <div className="text-xs leading-snug text-slate-400">{comfortLabel}</div>
            </div>
            <div className="rounded-xl border border-slate-700/40 bg-slate-950/20 p-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Sun className="h-4 w-4 text-yellow-400" />
                UV
              </div>
              <div className="mt-1 text-xl font-semibold text-white">{uvIndex.toFixed(1)}</div>
              <div className="text-xs leading-snug text-slate-400">{uvNote}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
