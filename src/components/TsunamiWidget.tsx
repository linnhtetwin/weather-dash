import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Waves } from 'lucide-react';
import { XMLParser } from 'fast-xml-parser';

interface TsunamiWidgetProps {
  tsunamiData: any;
}

export function TsunamiWidget({ tsunamiData }: TsunamiWidgetProps) {
  const parser = new XMLParser();
  let items = [];

  if (tsunamiData) {
    try {
      const jsonObj = parser.parse(tsunamiData);
      items = jsonObj.rss?.channel?.item || [];
      if (!Array.isArray(items)) items = [items];
    } catch (e) {
      console.error("Error parsing tsunami XML:", e);
    }
  }

  return (
    <Card className="flex flex-col h-full bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-2 border-b border-slate-700/50">
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Waves className="w-5 h-5 text-blue-400" />
          Tsunami Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide max-h-[400px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
            <Waves className="w-12 h-12 mb-2 opacity-20" />
            <p>No active tsunami alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {items.map((item: any, i: number) => (
              <div key={i} className="p-4 hover:bg-slate-800/80 transition-colors">
                <div className="text-sm font-medium text-slate-200">{item.title}</div>
                <div className="text-xs text-slate-400 mt-1">{item.description}</div>
                <div className="text-xs text-slate-500 mt-2">{item.pubDate}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
