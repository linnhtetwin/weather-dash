import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { fetchHistoricalWeather, fetchHistoricalAQI } from '../services/api';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Calendar, Loader2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { convertPrecipitation, convertSpeed, convertTemperature, type UnitSettings } from '../lib/units';

interface HistoricalDataProps {
  lat: number;
  lon: number;
  units: UnitSettings;
}

export function HistoricalData({ lat, lon, units }: HistoricalDataProps) {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<'temp' | 'precip' | 'wind' | 'aqi'>('temp');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [weather, aqi] = await Promise.all([
          fetchHistoricalWeather(lat, lon, startDate, endDate),
          fetchHistoricalAQI(lat, lon, startDate, endDate)
        ]);

        const combinedData = [];
        if (weather && weather.hourly && weather.hourly.time) {
          for (let i = 0; i < weather.hourly.time.length; i++) {
            combinedData.push({
              time: format(new Date(weather.hourly.time[i]), 'MMM d, h a'),
              temp: convertTemperature(weather.hourly.temperature_2m[i], units.temperature),
              precip: convertPrecipitation(weather.hourly.precipitation[i], units.precipitation),
              wind: convertSpeed(weather.hourly.wind_speed_10m[i], units.speed),
              aqi: aqi?.hourly?.european_aqi?.[i] || 0,
            });
          }
        }
        setData(combinedData);
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (lat && lon && startDate && endDate) {
      loadData();
    }
  }, [lat, lon, startDate, endDate, units.temperature, units.precipitation, units.speed]);

  const getChartConfig = () => {
    switch (chartType) {
      case 'temp': return { key: 'temp', color: '#ef4444', label: `Temperature (${units.temperature === 'fahrenheit' ? '°F' : units.temperature === 'kelvin' ? 'K' : '°C'})` };
      case 'precip': return { key: 'precip', color: '#3b82f6', label: `Precipitation (${units.precipitation})` };
      case 'wind': return { key: 'wind', color: '#10b981', label: `Wind Speed (${units.speed === 'mph' ? 'mph' : units.speed === 'ms' ? 'm/s' : 'km/h'})` };
      case 'aqi': return { key: 'aqi', color: '#8b5cf6', label: 'AQI' };
    }
  };

  const config = getChartConfig();

  return (
    <Card className="bg-[#1e293b] col-span-full">
      <CardHeader className="pb-4 border-b border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Calendar className="w-5 h-5 text-blue-400" /> Historical Data
        </CardTitle>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={endDate}
            />
            <span className="text-slate-500">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={format(subDays(new Date(), 1), 'yyyy-MM-dd')}
            />
          </div>
          <select 
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
          >
            <option value="temp">Temperature</option>
            <option value="precip">Precipitation</option>
            <option value="wind">Wind Speed</option>
            <option value="aqi">Air Quality (AQI)</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading historical data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            No data available for the selected date range.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`colorHistory${chartType}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                  minTickGap={50}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  label={{ 
                    value: config.label, 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: '#94a3b8', 
                    fontSize: 12, 
                    dy: 50 
                  }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={config.key} 
                  stroke={config.color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#colorHistory${chartType})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
