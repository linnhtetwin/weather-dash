import axios from 'axios';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const WEATHER_GFS_API_URL = 'https://api.open-meteo.com/v1/gfs';
const AQI_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const EARTHQUAKE_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const EARTHQUAKE_FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';
const HISTORICAL_WEATHER_API_URL = 'https://archive-api.open-meteo.com/v1/archive';
const TSUNAMI_PRIMARY_RSS = 'https://www.weather.gov/alerts/rss/tsunami.php';
const TSUNAMI_FALLBACK_RSS = 'https://www.weather.gov/alerts/xml/TsunamiWarnings.xml';

export interface SourceMeta {
  provider: string;
  endpoint: string;
  mode: 'primary' | 'fallback';
  checkedAt: string;
  fallbackUsed?: boolean;
  secondary?: {
    provider: string;
    status: 'ok' | 'failed';
    temperatureDelta?: number;
    windDelta?: number;
    message?: string;
  };
}

const withMeta = <T extends Record<string, any>>(data: T, meta: SourceMeta): T => {
  return Object.assign(data, { __meta: meta });
};

const requestJson = async (url: string, params?: Record<string, any>) => {
  const response = await axios.get(url, {
    params,
    timeout: 12000,
    headers: {
      Accept: 'application/json, text/plain, */*',
    },
  });
  return response.data;
};

export const fetchWeatherData = async (lat: number, lon: number) => {
  const params = {
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
    timezone: 'auto',
    past_days: 1,
    forecast_days: 10,
  };

  const checkedAt = new Date().toISOString();
  const [primaryResult, secondaryResult] = await Promise.allSettled([
    requestJson(WEATHER_API_URL, params),
    requestJson(WEATHER_GFS_API_URL, { ...params, past_days: 0 }),
  ]);

  if (primaryResult.status === 'fulfilled') {
    const primary = primaryResult.value;
    const secondary = secondaryResult.status === 'fulfilled'
      ? {
          provider: 'NOAA GFS via Open-Meteo',
          status: 'ok' as const,
          temperatureDelta: Number((primary.current.temperature_2m - secondaryResult.value.current.temperature_2m).toFixed(1)),
          windDelta: Number((primary.current.wind_speed_10m - secondaryResult.value.current.wind_speed_10m).toFixed(1)),
        }
      : {
          provider: 'NOAA GFS via Open-Meteo',
          status: 'failed' as const,
          message: 'Cross-check unavailable',
        };

    return withMeta(primary, {
      provider: 'Open-Meteo Best Match',
      endpoint: WEATHER_API_URL,
      mode: 'primary',
      checkedAt,
      secondary,
    });
  }

  if (secondaryResult.status === 'fulfilled') {
    return withMeta(secondaryResult.value, {
      provider: 'NOAA GFS via Open-Meteo',
      endpoint: WEATHER_GFS_API_URL,
      mode: 'fallback',
      checkedAt,
      fallbackUsed: true,
      secondary: {
        provider: 'Open-Meteo Best Match',
        status: 'failed',
        message: 'Primary weather source unavailable',
      },
    });
  }

  throw primaryResult.reason;
};

export const fetchAirQualityData = async (lat: number, lon: number) => {
  const params = {
    latitude: lat,
    longitude: lon,
    current: 'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index',
    timezone: 'auto',
  };

  const checkedAt = new Date().toISOString();

  try {
    const data = await requestJson(AQI_API_URL, { ...params, domains: 'auto' });
    return withMeta(data, {
      provider: 'Open-Meteo Air Quality Auto Domain',
      endpoint: AQI_API_URL,
      mode: 'primary',
      checkedAt,
    });
  } catch (primaryError) {
    const data = await requestJson(AQI_API_URL, { ...params, domains: 'cams_global' });
    return withMeta(data, {
      provider: 'CAMS Global via Open-Meteo',
      endpoint: AQI_API_URL,
      mode: 'fallback',
      checkedAt,
      fallbackUsed: true,
    });
  }
};

export const searchLocation = async (query: string) => {
  const params = {
    name: query,
    count: 5,
    language: 'en',
    format: 'json',
  };

  try {
    const response = await axios.get(GEOCODING_API_URL, { params, timeout: 10000 });
    return response.data.results || [];
  } catch (error) {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      timeout: 10000,
      params: {
        q: query,
        format: 'jsonv2',
        limit: 5,
        addressdetails: 1,
      },
    });

    return (response.data || []).map((item: any) => ({
      id: item.place_id,
      name: item.name || item.display_name?.split(',')[0] || 'Unknown location',
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      admin1: item.address?.state || item.address?.province || item.address?.county || '',
      country: item.address?.country || '',
      source: 'Nominatim',
    }));
  }
};

export const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { timeout: 10000 });
    const address = response.data.address;
    return address.city || address.town || address.village || address.county || response.data.name || "Current Location";
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "Current Location";
  }
};

export const fetchEarthquakes = async (lat: number, lon: number, radiusKm: number = 500) => {
  // Fetch earthquakes in the last 7 days within radius
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const params = {
    format: 'geojson',
    starttime: startDate.toISOString().split('T')[0],
    endtime: endDate.toISOString().split('T')[0],
    latitude: lat,
    longitude: lon,
    maxradiuskm: radiusKm,
    minmagnitude: 2.5, // Only significant ones
    orderby: 'time',
    limit: 10,
  };

  try {
    const response = await axios.get(EARTHQUAKE_API_URL, { params, timeout: 12000 });
    const features = response.data.features || [];
    return Object.assign(features, {
      __meta: {
        provider: 'USGS FDSN Event Web Service',
        endpoint: EARTHQUAKE_API_URL,
        mode: 'primary',
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Primary earthquake API failed, using USGS feed fallback:", error);
    try {
      const response = await axios.get(EARTHQUAKE_FEED_URL, { timeout: 12000 });
      const maxDistance = radiusKm;
      const features = (response.data.features || [])
        .map((feature: any) => ({
          ...feature,
          distanceKm: getDistanceKm(lat, lon, feature.geometry.coordinates[1], feature.geometry.coordinates[0]),
        }))
        .filter((feature: any) => feature.distanceKm <= maxDistance)
        .slice(0, 10);
      return Object.assign(features, {
        __meta: {
          provider: 'USGS 2.5+ Weekly GeoJSON Feed',
          endpoint: EARTHQUAKE_FEED_URL,
          mode: 'fallback',
          checkedAt: new Date().toISOString(),
          fallbackUsed: true,
        },
      });
    } catch (fallbackError) {
      console.error("Error fetching earthquakes:", fallbackError);
      return [];
    }
  }
};

export const fetchAsiaEarthquakes = async () => {
  // Bounding box for Asia/ASEAN
  const params = {
    format: 'geojson',
    minlatitude: -10,
    maxlatitude: 60,
    minlongitude: 60,
    maxlongitude: 150,
    minmagnitude: 4.0,
    orderby: 'time',
    limit: 10,
  };

  try {
    const response = await axios.get(EARTHQUAKE_API_URL, { params });
    return response.data.features || [];
  } catch (error) {
    console.error("Error fetching Asia earthquakes:", error);
    return [];
  }
};

export const fetchTsunamiAlerts = async () => {
  try {
    const response = await axios.get(TSUNAMI_PRIMARY_RSS, { timeout: 12000 });
    return response.data;
  } catch (error) {
    console.error("Primary tsunami RSS failed, using fallback feed:", error);
    try {
      const response = await axios.get(TSUNAMI_FALLBACK_RSS, { timeout: 12000 });
      return response.data;
    } catch (fallbackError) {
      console.error("Error fetching tsunami alerts:", fallbackError);
      return null;
    }
  }
};

export const fetchHistoricalWeather = async (lat: number, lon: number, startDate: string, endDate: string) => {
  const params = {
    latitude: lat,
    longitude: lon,
    start_date: startDate,
    end_date: endDate,
    hourly: 'temperature_2m,precipitation,wind_speed_10m',
    timezone: 'auto',
  };
  const response = await axios.get(HISTORICAL_WEATHER_API_URL, { params, timeout: 12000 });
  return response.data;
};

export const fetchHistoricalAQI = async (lat: number, lon: number, startDate: string, endDate: string) => {
  const params = {
    latitude: lat,
    longitude: lon,
    start_date: startDate,
    end_date: endDate,
    hourly: 'european_aqi,pm10,pm2_5',
    timezone: 'auto',
  };
  const response = await axios.get(AQI_API_URL, { params, timeout: 12000 });
  return response.data;
};

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
