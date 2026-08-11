import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accessibility, Gauge, Ruler, Thermometer, Wind, CloudRain, Type, Eye, Activity } from 'lucide-react';
import type { AppSettings, AccessibilitySettings, UnitSettings } from '../lib/units';

interface SettingsPageProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const fieldClass = "w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400";

export function SettingsPage({ settings, onSettingsChange }: SettingsPageProps) {
  const updateUnits = <K extends keyof UnitSettings>(key: K, value: UnitSettings[K]) => {
    onSettingsChange({ ...settings, units: { ...settings.units, [key]: value } });
  };

  const updateAccessibility = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    onSettingsChange({ ...settings, accessibility: { ...settings.accessibility, [key]: value } });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="bg-[#1e293b]">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
            <Gauge className="h-5 w-5 text-cyan-300" />
            Unit Preferences
          </CardTitle>
          <p className="text-sm leading-6 text-slate-400">
            Choose the units that make the dashboard easiest to read. Each group can be mixed independently.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Thermometer className="h-4 w-4 text-orange-300" />
              Temperature
            </span>
            <select className={fieldClass} value={settings.units.temperature} onChange={(e) => updateUnits('temperature', e.target.value as UnitSettings['temperature'])}>
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
              <option value="kelvin">Kelvin (K)</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Wind className="h-4 w-4 text-blue-300" />
              Wind Speed
            </span>
            <select className={fieldClass} value={settings.units.speed} onChange={(e) => updateUnits('speed', e.target.value as UnitSettings['speed'])}>
              <option value="kmh">Kilometers/hour (km/h)</option>
              <option value="mph">Miles/hour (mph)</option>
              <option value="ms">Meters/second (m/s)</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Ruler className="h-4 w-4 text-emerald-300" />
              Distance & Visibility
            </span>
            <select className={fieldClass} value={settings.units.distance} onChange={(e) => updateUnits('distance', e.target.value as UnitSettings['distance'])}>
              <option value="km">Kilometers (km)</option>
              <option value="mi">Miles (mi)</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Gauge className="h-4 w-4 text-purple-300" />
              Pressure
            </span>
            <select className={fieldClass} value={settings.units.pressure} onChange={(e) => updateUnits('pressure', e.target.value as UnitSettings['pressure'])}>
              <option value="mb">Millibar / hPa (mb)</option>
              <option value="pa">Pascal (Pa)</option>
              <option value="kpa">Kilopascal (kPa)</option>
              <option value="bar">Bar (bar)</option>
              <option value="mmhg">Millimeters mercury (mmHg)</option>
              <option value="inhg">Inches mercury (inHg)</option>
            </select>
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <CloudRain className="h-4 w-4 text-sky-300" />
              Precipitation
            </span>
            <select className={fieldClass} value={settings.units.precipitation} onChange={(e) => updateUnits('precipitation', e.target.value as UnitSettings['precipitation'])}>
              <option value="mm">Millimeters (mm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </label>
        </CardContent>
      </Card>

      <Card className="bg-[#1e293b]">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
            <Accessibility className="h-5 w-5 text-cyan-300" />
            Accessibility
          </CardTitle>
          <p className="text-sm leading-6 text-slate-400">
            These controls support WCAG 2.1 AA-oriented readability, keyboard focus, contrast, and motion preferences.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Type className="h-4 w-4 text-cyan-300" />
              Text Size
            </span>
            <select className={fieldClass} value={settings.accessibility.textSize} onChange={(e) => updateAccessibility('textSize', e.target.value as AccessibilitySettings['textSize'])}>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="extra">Extra large</option>
            </select>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/30 p-4">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-2 focus:ring-cyan-400"
              checked={settings.accessibility.highContrast}
              onChange={(e) => updateAccessibility('highContrast', e.target.checked)}
            />
            <span>
              <span className="flex items-center gap-2 font-medium text-slate-100">
                <Eye className="h-4 w-4 text-yellow-300" />
                High contrast mode
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-400">Strengthens outlines, text contrast, and focus visibility.</span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/30 p-4">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-2 focus:ring-cyan-400"
              checked={settings.accessibility.reduceMotion}
              onChange={(e) => updateAccessibility('reduceMotion', e.target.checked)}
            />
            <span>
              <span className="flex items-center gap-2 font-medium text-slate-100">
                <Activity className="h-4 w-4 text-rose-300" />
                Reduce motion
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-400">Limits decorative animation for users sensitive to motion.</span>
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
