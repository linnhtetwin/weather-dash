import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, Navigation, Activity, Calendar, Bell, Droplets, Wind, Eye, Sun, Settings } from 'lucide-react';
import { fetchWeatherData, fetchAirQualityData, searchLocation, fetchEarthquakes, reverseGeocode, fetchTsunamiAlerts } from './services/api';
import { WindWidget } from './components/WindWidget';
import { CloudVisibilityWidget } from './components/CloudVisibilityWidget';
import { PressureWidget } from './components/PressureWidget';
import { PrecipitationWidget } from './components/PrecipitationWidget';
import { UVIndexWidget } from './components/UVIndexWidget';
import { SuggestionsWidget } from './components/SuggestionsWidget';
import { ForecastWidget } from './components/ForecastWidget';
import { EarthquakeWidget } from './components/EarthquakeWidget';
import { TsunamiWidget } from './components/TsunamiWidget';
import { AlertsManager } from './components/AlertsManager';
import { HistoricalData } from './components/HistoricalData';
import { AQIWidget } from './components/AQIWidget';
import { ComfortWidget } from './components/ComfortWidget';
import { SettingsPage } from './components/SettingsPage';
import { defaultSettings, formatDistance, formatSpeed, formatTemperature, loadSettings, type AppSettings } from './lib/units';

type Tab = 'dashboard' | 'history' | 'alerts' | 'settings';

const getWeatherSummary = (code: number) => {
  if (code >= 95) return 'Thunderstorm';
  if (code >= 71 && code <= 77) return 'Snowfall';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Rain expected';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([1, 2, 3].includes(code)) return 'Partly cloudy';
  return 'Clear sky';
};

const getConditionTone = (code: number) => {
  if (code >= 95) return 'from-violet-500 via-slate-800 to-amber-500';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'from-sky-500 via-cyan-600 to-slate-900';
  if ([1, 2, 3, 45, 48].includes(code)) return 'from-cyan-500 via-slate-700 to-indigo-900';
  return 'from-amber-400 via-sky-500 to-cyan-700';
};

const getAqiLabel = (aqi: number) => {
  if (aqi <= 20) return 'Good';
  if (aqi <= 40) return 'Fair';
  if (aqi <= 60) return 'Moderate';
  if (aqi <= 80) return 'Poor';
  return 'Very poor';
};

const formatUpdatedTime = (time?: string) => {
  if (!time) return 'Updated just now';
  return `Updated ${new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [location, setLocation] = useState({ name: 'Samut Prakan', lat: 13.5993, lon: 100.5968 });
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const [weatherData, setWeatherData] = useState<any>(null);
  const [aqiData, setAqiData] = useState<any>(null);
  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  const [tsunamiData, setTsunamiData] = useState<any>(null);
  const [eqRadius, setEqRadius] = useState(500);
  const [loading, setLoading] = useState(true);
  const [loadingEarthquakes, setLoadingEarthquakes] = useState(false);
  const [locating, setLocating] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof localStorage === 'undefined') return defaultSettings;
    return loadSettings();
  });

  useEffect(() => {
    localStorage.setItem('weatherDashSettings', JSON.stringify(settings));
    document.documentElement.dataset.textSize = settings.accessibility.textSize;
    document.documentElement.dataset.contrast = settings.accessibility.highContrast ? 'high' : 'normal';
    document.documentElement.dataset.motion = settings.accessibility.reduceMotion ? 'reduced' : 'normal';
  }, [settings]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [weather, aqi, tsunami] = await Promise.all([
          fetchWeatherData(location.lat, location.lon),
          fetchAirQualityData(location.lat, location.lon),
          fetchTsunamiAlerts()
        ]);
        setWeatherData(weather);
        setAqiData(aqi);
        setTsunamiData(tsunami);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location]);

  useEffect(() => {
    const loadEarthquakes = async () => {
      setLoadingEarthquakes(true);
      try {
        const eq = await fetchEarthquakes(location.lat, location.lon, eqRadius);
        setEarthquakes(eq);
      } catch (error) {
        console.error("Failed to fetch earthquakes:", error);
      } finally {
        setLoadingEarthquakes(false);
      }
    };

    loadEarthquakes();
  }, [location, eqRadius]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 2) {
      const results = await searchLocation(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectLocation = (loc: any) => {
    setLocation({ name: loc.name, lat: loc.latitude, lon: loc.longitude });
    setQuery('');
    setSearchResults([]);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const name = await reverseGeocode(lat, lon);
        setLocation({ name, lat, lon });
        setLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check your permissions.");
        setLocating(false);
      }
    );
  };

  const currentAlertData = weatherData && aqiData ? {
    temperature: weatherData.current.temperature_2m,
    aqi: aqiData.current.european_aqi || 0,
    wind: weatherData.current.wind_speed_10m,
    uv: weatherData.hourly.uv_index?.[new Date().getHours()] || 0,
  } : null;

  const currentHour = new Date().getHours();
  const currentUv = weatherData?.hourly?.uv_index?.[currentHour] || 0;
  const currentVisibility = weatherData?.hourly?.visibility?.[currentHour] || 10000;
  const aqi = aqiData?.current?.european_aqi || 0;
  const heroTone = weatherData ? getConditionTone(weatherData.current.weather_code) : 'from-sky-500 via-cyan-600 to-slate-900';
  const units = settings.units;

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#155e75_0,#0f172a_34%,#020617_100%)] text-slate-100 font-sans">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="relative max-w-7xl mx-auto space-y-6 px-4 py-5 md:px-8 md:py-8">
        {/* Header & Search */}
        <header className="relative z-50 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl">
          <div className="flex items-center gap-3 px-2">
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Weather<span className="text-cyan-300">Dash</span></h1>
              <p className="text-xs text-slate-400">Live weather and environmental intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={handleLocateMe}
              disabled={locating}
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 p-3 rounded-2xl transition-colors disabled:opacity-50"
              title="Locate Me"
            >
              {locating ? <Loader2 className="w-5 h-5 animate-spin text-cyan-300" /> : <Navigation className="w-5 h-5 text-cyan-300" />}
            </button>
            <div className="relative flex-1 md:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  value={query}
                  onChange={handleSearch}
                  placeholder="Search location..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all placeholder:text-slate-500"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl shadow-slate-950/50 overflow-hidden z-[100] backdrop-blur-xl">
                  {searchResults.map((res: any) => (
                    <button
                      key={res.id}
                      onClick={() => selectLocation(res)}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-2 border-b border-white/10 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-slate-200">{res.name}</div>
                        <div className="text-xs text-slate-400">{res.admin1}, {res.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {weatherData && (
          <section className={`relative z-0 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${heroTone} p-5 shadow-2xl shadow-slate-950/40 md:p-7`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(255,255,255,0.16),transparent_24%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                  <MapPin className="w-3.5 h-3.5" />
                  {location.name}
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="text-6xl font-black leading-none tracking-tight text-white sm:text-8xl">
                    {formatTemperature(weatherData.current.temperature_2m, units.temperature)}
                  </div>
                  <div className="pb-2">
                    <div className="text-2xl font-semibold text-white">{getWeatherSummary(weatherData.current.weather_code)}</div>
                    <div className="mt-1 text-sm text-white/75">
                      Feels like {formatTemperature(weatherData.current.apparent_temperature, units.temperature)} · {formatUpdatedTime(weatherData.current.time)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Humidity', value: `${Math.round(weatherData.current.relative_humidity_2m)}%`, icon: Droplets },
                  { label: 'Wind', value: formatSpeed(weatherData.current.wind_speed_10m, units.speed), icon: Wind },
                  { label: 'Visibility', value: formatDistance(currentVisibility, units.distance), icon: Eye },
                  { label: 'AQI', value: `${aqi} · ${getAqiLabel(aqi)}`, icon: Sun },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 backdrop-blur-md">
                    <item.icon className="mb-3 h-5 w-5 text-white/80" />
                    <div className="text-xs text-white/60">{item.label}</div>
                    <div className="mt-1 text-lg font-bold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/35 p-1.5 shadow-lg shadow-slate-950/20 backdrop-blur-xl scrollbar-hide">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}
          >
            <Activity className="w-4 h-4" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}
          >
            <Calendar className="w-4 h-4" /> Historical Data
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'alerts' ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}
          >
            <Bell className="w-4 h-4" /> Alerts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-400 animate-pulse">Gathering environmental data...</p>
          </div>
        ) : weatherData && (
          <>
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Top Row - Wind, Cloud, UV, AQI */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                  <WindWidget 
                    speed={weatherData.current.wind_speed_10m}
                    gusts={weatherData.current.wind_gusts_10m}
                    direction={weatherData.current.wind_direction_10m}
                    units={units}
                  />
                </div>
                
                <CloudVisibilityWidget 
                  cloudCover={weatherData.current.cloud_cover}
                  visibility={weatherData.hourly.visibility?.[new Date().getHours()] || 10000}
                  units={units}
                />
                
                <UVIndexWidget 
                  uvIndex={weatherData.hourly.uv_index?.[new Date().getHours()] || 0}
                />
                
                <AQIWidget 
                  aqi={aqiData.current.european_aqi || 0}
                />

                <ComfortWidget
                  apparentTemperature={weatherData.current.apparent_temperature}
                  humidity={weatherData.current.relative_humidity_2m}
                  uvIndex={weatherData.hourly.uv_index?.[new Date().getHours()] || 0}
                  units={units}
                />
                
                {/* Suggestions */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                  <SuggestionsWidget 
                    locationName={location.name}
                    weatherCode={weatherData.current.weather_code}
                    uvIndex={weatherData.hourly.uv_index?.[new Date().getHours()] || 0}
                    temperature={weatherData.current.temperature_2m}
                    units={units}
                  />
                </div>

                {/* Second Row - Precip, Pressure */}
                <PrecipitationWidget 
                  precipitation={weatherData.current.precipitation}
                  weatherCode={weatherData.current.weather_code}
                  units={units}
                />
                
                <PressureWidget 
                  pressure={weatherData.current.surface_pressure}
                  units={units}
                />

                {/* Bottom Section */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 grid grid-cols-1 gap-4">
                  <div className="min-w-0">
                    <ForecastWidget 
                      locationName={location.name}
                      daily={weatherData.daily}
                      hourly={weatherData.hourly}
                      units={units}
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    <EarthquakeWidget 
                      earthquakes={earthquakes} 
                    onRadiusChange={setEqRadius} 
                    currentRadius={eqRadius} 
                    units={units}
                  />
                    <TsunamiWidget tsunamiData={tsunamiData} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <HistoricalData lat={location.lat} lon={location.lon} units={units} />
            )}

            {activeTab === 'alerts' && (
              <AlertsManager currentData={currentAlertData} units={units} />
            )}

            {activeTab === 'settings' && (
              <SettingsPage settings={settings} onSettingsChange={setSettings} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
