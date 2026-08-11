import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { format, parseISO, isSameDay } from 'date-fns';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Sun, CloudRain, Cloud, CloudLightning, CloudSnow, Droplets, Sunrise, Sunset, Thermometer, Wind, ChevronRight } from 'lucide-react';
import { convertPrecipitation, convertSpeed, convertTemperature, formatPrecipitation, formatSpeed, formatTemperature, type UnitSettings } from '../lib/units';

interface ForecastWidgetProps {
  locationName: string;
  daily: any;
  hourly: any;
  units: UnitSettings;
}

export function ForecastWidget({ locationName, daily, hourly, units }: ForecastWidgetProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [chartType, setChartType] = useState<'temp' | 'precip' | 'wind'>('temp');

  useEffect(() => {
    if (!daily || !daily.time) return;
    const todayIndex = daily.time.findIndex((timeStr: string) => isSameDay(parseISO(timeStr), new Date()));
    setSelectedDayIndex(todayIndex !== -1 ? todayIndex : 0);
  }, [daily]);

  if (!daily || !daily.time || daily.time.length === 0) return null;

  const selectedDate = parseISO(daily.time[selectedDayIndex]);
  const isToday = isSameDay(selectedDate, new Date());

  // Filter hourly data for the selected day
  const hourlyData = [];
  const currentHour = new Date().getHours();
  let totalHumidity = 0;
  let humidityCount = 0;
  
  if (hourly && hourly.time) {
    for (let i = 0; i < hourly.time.length; i++) {
      const time = parseISO(hourly.time[i]);
      if (isSameDay(time, selectedDate)) {
        hourlyData.push({
          time: format(time, 'h a'),
          hour: time.getHours(),
          temp: convertTemperature(hourly.temperature_2m[i], units.temperature),
          precip: convertPrecipitation(hourly.precipitation[i], units.precipitation),
          wind: convertSpeed(hourly.wind_speed_10m[i], units.speed),
          isCurrent: isToday && time.getHours() === currentHour
        });
        if (hourly.relative_humidity_2m && hourly.relative_humidity_2m[i] !== undefined) {
          totalHumidity += hourly.relative_humidity_2m[i];
          humidityCount++;
        }
      }
    }
  }
  
  const avgHumidity = humidityCount > 0 ? Math.round(totalHumidity / humidityCount) : '--';

  const getWeatherIcon = (code: number, className = "w-6 h-6") => {
    if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-blue-200`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-yellow-400`} />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className={`${className} text-blue-400`} />;
    if ([1, 2, 3].includes(code)) return <Cloud className={`${className} text-slate-300`} />;
    return <Sun className={`${className} text-yellow-400`} />;
  };

  const getWeatherDescription = (code: number) => {
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 95) return "Thunderstorm";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
    if ([1, 2, 3].includes(code)) return "Partly Cloudy";
    return "Clear Sky";
  };

  return (
    <Card className="flex flex-col bg-[#1e293b] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-slate-700/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg sm:text-xl leading-snug text-slate-200">
          <span className="text-blue-400 font-semibold break-words">{locationName}</span> 10-Day Weather Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Daily Horizontal Scroll */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {daily.time.map((timeStr: string, index: number) => {
            const date = parseISO(timeStr);
            const isSelected = index === selectedDayIndex;
            const isTodayItem = isSameDay(date, new Date());
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDayIndex(index)}
                className={`flex-shrink-0 w-36 sm:w-40 p-4 rounded-xl border transition-all snap-start text-left relative overflow-hidden ${
                  isSelected 
                    ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className={`font-medium ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>
                    {isTodayItem ? 'Today' : format(date, 'EEEE')}
                  </div>
                  <span className="text-xs bg-slate-700/50 rounded-full p-0.5 text-slate-400"><ChevronRight className="w-3 h-3" /></span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  {getWeatherIcon(daily.weather_code[index], "w-10 h-10")}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-200 font-medium">
                      <Thermometer className="w-3 h-3 text-slate-400" />
                      {formatTemperature(daily.temperature_2m_max[index], units.temperature)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-slate-400 text-sm mt-1">
                      <Droplets className="w-3 h-3" />
                      {daily.precipitation_probability_max[index]}%
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500/20 rotate-45 border-t border-l border-blue-500/50" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Details */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 sm:p-6 grid gap-5">
          <div className="grid min-w-0 gap-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center">
            <div className="text-left sm:text-center">
              <div className="text-slate-400 text-sm">{isToday ? 'Today' : format(selectedDate, 'EEEE')}</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-200">{format(selectedDate, 'd MMM')}</div>
            </div>
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                {getWeatherIcon(daily.weather_code[selectedDayIndex], "w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-semibold text-slate-100">{getWeatherDescription(daily.weather_code[selectedDayIndex])}</div>
                <div className="text-sm leading-6 text-slate-400 mt-1">
                  {getWeatherDescription(daily.weather_code[selectedDayIndex])} with temperature at {formatTemperature(daily.temperature_2m_max[selectedDayIndex], units.temperature)} and winds up to {formatSpeed(daily.wind_speed_10m_max[selectedDayIndex], units.speed)}.
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 border-t border-slate-700/50 pt-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950/20 p-3">
              <div className="flex items-center gap-2 text-slate-200 font-medium text-sm sm:text-base">
                <Thermometer className="w-4 h-4 text-slate-400" />
                {formatTemperature(daily.temperature_2m_max[selectedDayIndex], units.temperature)} / {formatTemperature(daily.temperature_2m_min[selectedDayIndex], units.temperature)}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Droplets className="w-3 h-3" /> Humi. <span className="text-slate-200 ml-auto">{avgHumidity}%</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <CloudRain className="w-3 h-3" /> Prec. <span className="text-slate-200 ml-auto">{formatPrecipitation(daily.precipitation_sum[selectedDayIndex], units.precipitation)}</span>
              </div>
            </div>
            
            <div className="flex flex-col justify-center items-center rounded-xl bg-slate-950/20 p-3 text-center">
              <Sunrise className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mb-1" />
              <div className="text-[10px] sm:text-xs text-slate-400">Sunrise</div>
              <div className="font-medium text-slate-200 text-xs sm:text-sm">{format(parseISO(daily.sunrise[selectedDayIndex]), 'hh:mm a')}</div>
            </div>
            
            <div className="flex flex-col justify-center items-center rounded-xl bg-slate-950/20 p-3 text-center">
              <Sunset className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mb-1" />
              <div className="text-[10px] sm:text-xs text-slate-400">Sunset</div>
              <div className="font-medium text-slate-200 text-xs sm:text-sm">{format(parseISO(daily.sunset[selectedDayIndex]), 'hh:mm a')}</div>
            </div>
          </div>
        </div>

        {/* Hourly Chart */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 text-sm font-medium">
              <button 
                className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
                disabled={selectedDayIndex === 0}
              >
                Previous Day
              </button>
              <button 
                className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                onClick={() => setSelectedDayIndex(Math.min(daily.time.length - 1, selectedDayIndex + 1))}
                disabled={selectedDayIndex === daily.time.length - 1}
              >
                Next Day
              </button>
            </div>
            <select 
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
            >
              <option value="temp">Temp.</option>
              <option value="precip">Precip.</option>
              <option value="wind">Wind</option>
            </select>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  label={{ 
                    value: chartType === 'temp'
                      ? `Temperature (${units.temperature === 'fahrenheit' ? '°F' : units.temperature === 'kelvin' ? 'K' : '°C'})`
                      : chartType === 'precip'
                        ? `Precipitation (${units.precipitation})`
                        : `Wind (${units.speed === 'mph' ? 'mph' : units.speed === 'ms' ? 'm/s' : 'km/h'})`, 
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
                  dataKey={chartType} 
                  stroke={chartType === 'temp' ? '#ef4444' : chartType === 'precip' ? '#3b82f6' : '#10b981'} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#color${chartType.charAt(0).toUpperCase() + chartType.slice(1)})`} 
                />
                {isToday && (
                  <ReferenceLine 
                    x={format(new Date(), 'h a')} 
                    stroke="#f8fafc" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ 
                      position: 'insideTopLeft', 
                      value: 'Current Local Hour', 
                      fill: '#1e293b', 
                      fontSize: 10,
                      fontWeight: 'bold',
                      className: 'bg-white px-2 py-1 rounded'
                    }} 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
