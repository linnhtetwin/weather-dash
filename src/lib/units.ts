export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';
export type SpeedUnit = 'kmh' | 'mph' | 'ms';
export type DistanceUnit = 'km' | 'mi';
export type PressureUnit = 'mb' | 'pa' | 'kpa' | 'bar' | 'mmhg' | 'inhg';
export type PrecipitationUnit = 'mm' | 'in';
export type TextSize = 'normal' | 'large' | 'extra';

export interface UnitSettings {
  temperature: TemperatureUnit;
  speed: SpeedUnit;
  distance: DistanceUnit;
  pressure: PressureUnit;
  precipitation: PrecipitationUnit;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reduceMotion: boolean;
  textSize: TextSize;
}

export interface AppSettings {
  units: UnitSettings;
  accessibility: AccessibilitySettings;
}

export const defaultSettings: AppSettings = {
  units: {
    temperature: 'celsius',
    speed: 'kmh',
    distance: 'km',
    pressure: 'mb',
    precipitation: 'mm',
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    textSize: 'normal',
  },
};

export const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem('weatherDashSettings');
    if (!saved) return defaultSettings;
    const parsed = JSON.parse(saved);
    return {
      units: { ...defaultSettings.units, ...parsed.units },
      accessibility: { ...defaultSettings.accessibility, ...parsed.accessibility },
    };
  } catch {
    return defaultSettings;
  }
};

export const formatTemperature = (celsius: number, unit: TemperatureUnit, decimals = 0) => {
  const value = unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : unit === 'kelvin' ? celsius + 273.15 : celsius;
  if (unit === 'kelvin') return `${value.toFixed(decimals)} K`;
  const suffix = unit === 'fahrenheit' ? 'F' : 'C';
  return `${value.toFixed(decimals)}°${suffix}`;
};

export const convertTemperature = (celsius: number, unit: TemperatureUnit) => {
  if (unit === 'fahrenheit') return (celsius * 9) / 5 + 32;
  if (unit === 'kelvin') return celsius + 273.15;
  return celsius;
};

export const convertSpeed = (kmh: number, unit: SpeedUnit) => {
  if (unit === 'mph') return kmh * 0.621371;
  if (unit === 'ms') return kmh / 3.6;
  return kmh;
};

export const formatSpeed = (kmh: number, unit: SpeedUnit, decimals = unit === 'ms' ? 1 : 0) => {
  const suffix = unit === 'mph' ? 'mph' : unit === 'ms' ? 'm/s' : 'km/h';
  return `${convertSpeed(kmh, unit).toFixed(decimals)} ${suffix}`;
};

export const formatDistance = (meters: number, unit: DistanceUnit, decimals = 0) => {
  const km = meters / 1000;
  const value = unit === 'mi' ? km * 0.621371 : km;
  return `${value.toFixed(decimals)} ${unit}`;
};

export const formatRadius = (km: number, unit: DistanceUnit, decimals = 0) => {
  const value = unit === 'mi' ? km * 0.621371 : km;
  return `${value.toFixed(decimals)} ${unit}`;
};

export const convertPressure = (mb: number, unit: PressureUnit) => {
  switch (unit) {
    case 'pa': return mb * 100;
    case 'kpa': return mb * 0.1;
    case 'bar': return mb / 1000;
    case 'mmhg': return mb * 0.750062;
    case 'inhg': return mb * 0.02953;
    default: return mb;
  }
};

export const formatPressure = (mb: number, unit: PressureUnit) => {
  const decimals = unit === 'bar' ? 3 : unit === 'inhg' || unit === 'kpa' ? 1 : 0;
  const suffix = unit === 'mb' ? 'mb' : unit === 'pa' ? 'Pa' : unit === 'kpa' ? 'kPa' : unit === 'bar' ? 'bar' : unit === 'mmhg' ? 'mmHg' : 'inHg';
  return `${convertPressure(mb, unit).toFixed(decimals)} ${suffix}`;
};

export const convertPrecipitation = (mm: number, unit: PrecipitationUnit) => unit === 'in' ? mm / 25.4 : mm;

export const formatPrecipitation = (mm: number, unit: PrecipitationUnit, decimals = unit === 'in' ? 2 : 1) => {
  return `${convertPrecipitation(mm, unit).toFixed(decimals)} ${unit}`;
};
