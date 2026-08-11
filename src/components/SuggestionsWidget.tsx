import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Umbrella, Shirt, Car, Sun, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import type { UnitSettings } from '../lib/units';

interface SuggestionsWidgetProps {
  locationName: string;
  weatherCode: number;
  uvIndex: number;
  temperature: number;
  units: UnitSettings;
}

export function SuggestionsWidget({ locationName, weatherCode, uvIndex, temperature }: SuggestionsWidgetProps) {
  // Logic for suggestions
  const needsUmbrella = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
  const needsSunscreen = uvIndex >= 3;
  const clothing = temperature > 25 ? "Breathable" : temperature < 10 ? "Warm" : "Comfortable";
  const driving = needsUmbrella ? "Drive carefully" : "Enjoy Driving";
  const suggestionItems = [
    {
      label: "Umbrella",
      value: needsUmbrella ? "Required" : "Optional",
      Icon: Umbrella,
      iconClass: needsUmbrella ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-400",
      dotClass: needsUmbrella ? "bg-blue-400 animate-pulse" : "bg-slate-600",
    },
    {
      label: "Clothing",
      value: clothing,
      Icon: Shirt,
      iconClass: "bg-slate-800 text-slate-300",
      dotClass: "bg-blue-400",
    },
    {
      label: "Driving",
      value: driving,
      Icon: Car,
      iconClass: "bg-slate-800 text-slate-300",
      dotClass: needsUmbrella ? "bg-orange-400" : "bg-green-400",
    },
    {
      label: "Sunscreen",
      value: needsSunscreen ? "Apply" : "Not needed",
      Icon: Sun,
      iconClass: needsSunscreen ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-800 text-slate-400",
      dotClass: needsSunscreen ? "bg-yellow-400 animate-pulse" : "bg-slate-600",
    },
  ];

  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      <CardHeader className="p-4 sm:p-5 pb-4 border-b border-slate-700/50">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <CardTitle className="text-lg text-slate-200 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> Suggestions
            </CardTitle>
            <div className="text-blue-400 font-medium leading-snug break-words" title={locationName}>{locationName}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm text-slate-400">Today</div>
            <div className="text-lg font-medium text-white">{format(new Date(), 'd MMM.')}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-1 gap-2.5 p-4 sm:p-5 relative z-10">
        {suggestionItems.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-700/40 bg-slate-950/20 p-2.5">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${item.iconClass}`}>
              <item.Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-medium leading-snug text-slate-200 break-words">{item.label}</div>
              <div className="mt-0.5 flex items-start gap-1.5 text-sm leading-snug text-slate-400">
                <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${item.dotClass}`} />
                <span className="break-words">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
