import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bell, Plus, Trash2, AlertTriangle, Volume2, VolumeX, ShieldCheck, ShieldAlert } from 'lucide-react';
import { convertSpeed, convertTemperature, type UnitSettings } from '../lib/units';

export interface AlertRule {
  id: string;
  parameter: 'temperature' | 'aqi' | 'wind' | 'uv';
  condition: 'above' | 'below';
  value: number;
  active: boolean;
}

interface AlertsManagerProps {
  currentData: {
    temperature: number;
    aqi: number;
    wind: number;
    uv: number;
  } | null;
  units: UnitSettings;
}

export function AlertsManager({ currentData, units }: AlertsManagerProps) {
  const [rules, setRules] = useState<AlertRule[]>(() => {
    const saved = localStorage.getItem('weatherAlertRules');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('weatherAlertSound') === 'true');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('weatherAlertNotifications') === 'true');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(typeof Notification !== 'undefined' ? Notification.permission : 'default');

  const [newParameter, setNewParameter] = useState<AlertRule['parameter']>('temperature');
  const [newCondition, setNewCondition] = useState<AlertRule['condition']>('above');
  const [newValue, setNewValue] = useState<number>(0);

  const lastTriggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('weatherAlertRules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('weatherAlertSound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('weatherAlertNotifications', String(notificationsEnabled));
  }, [notificationsEnabled]);

  const playNotificationSound = (force = false) => {
    if (!soundEnabled && !force) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (notificationsEnabled && permissionStatus === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  useEffect(() => {
    if (!currentData) return;

    const triggered: string[] = [];
    const triggeredIds = new Set<string>();

    rules.forEach(rule => {
      if (!rule.active) return;
      const currentValue = rule.parameter === 'temperature'
        ? convertTemperature(currentData.temperature, units.temperature)
        : rule.parameter === 'wind'
          ? convertSpeed(currentData.wind, units.speed)
          : currentData[rule.parameter];
      let isTriggered = false;
      let message = '';

      if (rule.condition === 'above' && currentValue > rule.value) {
        isTriggered = true;
        message = `${getParamName(rule.parameter)} is ${currentValue} (Above ${rule.value})`;
      } else if (rule.condition === 'below' && currentValue < rule.value) {
        isTriggered = true;
        message = `${getParamName(rule.parameter)} is ${currentValue} (Below ${rule.value})`;
      }

      if (isTriggered) {
        triggered.push(message);
        triggeredIds.add(rule.id);
        
        // Only notify if this rule wasn't triggered in the last check
        if (!lastTriggeredRef.current.has(rule.id)) {
          sendNotification('Weather Alert Triggered', message);
          playNotificationSound();
        }
      }
    });

    lastTriggeredRef.current = triggeredIds;
    setActiveAlerts(triggered);
  }, [currentData, rules, notificationsEnabled, soundEnabled, permissionStatus, units.temperature, units.speed]);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
      setNotificationsEnabled(true);
    }
  };

  const addRule = () => {
    const newRule: AlertRule = {
      id: Math.random().toString(36).substring(7),
      parameter: newParameter,
      condition: newCondition,
      value: newValue,
      active: true,
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const getParamName = (param: string) => {
    switch(param) {
      case 'temperature': return `Temperature (${units.temperature === 'fahrenheit' ? '°F' : units.temperature === 'kelvin' ? 'K' : '°C'})`;
      case 'aqi': return 'AQI';
      case 'wind': return `Wind Speed (${units.speed === 'mph' ? 'mph' : units.speed === 'ms' ? 'm/s' : 'km/h'})`;
      case 'uv': return 'UV Index';
      default: return param;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card className="bg-[#1e293b] border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
            <Bell className="w-5 h-5 text-blue-400" /> Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              soundEnabled ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Sound Alerts: {soundEnabled ? 'ON' : 'OFF'}
          </button>

          {permissionStatus !== 'granted' ? (
            <button
              onClick={requestPermission}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
            >
              <ShieldAlert className="w-4 h-4" /> Enable Browser Notifications
            </button>
          ) : (
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                notificationsEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Notifications: {notificationsEnabled ? 'ON' : 'OFF'}
            </button>
          )}

          <button
            onClick={async () => {
              // If permission isn't granted, try to request it first
              if (permissionStatus === 'default') {
                await requestPermission();
              }
              
              // Force play for the test even if toggles are off
              if (permissionStatus === 'granted' || Notification.permission === 'granted') {
                try {
                  new Notification('Test Alert', { 
                    body: 'This is a test notification from WeatherDash. If you see this, notifications are working!',
                    icon: '/favicon.ico' 
                  });
                } catch (e) {
                  console.error('Notification failed:', e);
                }
              } else if (permissionStatus === 'denied') {
                console.warn('Notification permission is denied. Please enable it in your browser settings.');
              }
              
              // Force play sound for the test
              playNotificationSound(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all active:scale-95"
          >
            Test Alert
          </button>
        </CardContent>
      </Card>

      {activeAlerts.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-red-200">
              {activeAlerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#1e293b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Bell className="w-5 h-5 text-blue-400" /> Alert Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-slate-400 mb-1">Parameter</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500"
                value={newParameter}
                onChange={(e) => setNewParameter(e.target.value as any)}
              >
                <option value="temperature">Temperature ({units.temperature === 'fahrenheit' ? '°F' : units.temperature === 'kelvin' ? 'K' : '°C'})</option>
                <option value="aqi">AQI</option>
                <option value="wind">Wind Speed ({units.speed === 'mph' ? 'mph' : units.speed === 'ms' ? 'm/s' : 'km/h'})</option>
                <option value="uv">UV Index</option>
              </select>
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs text-slate-400 mb-1">Condition</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as any)}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs text-slate-400 mb-1">Value</label>
              <input 
                type="number" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500"
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
              />
            </div>
            <button 
              onClick={addRule}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="text-center text-slate-500 py-4">No alert rules defined.</div>
            ) : (
              rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      checked={rule.active}
                      onChange={() => toggleRule(rule.id)}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-900"
                    />
                    <span className={`text-sm ${rule.active ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                      Notify when <strong>{getParamName(rule.parameter)}</strong> is <strong>{rule.condition}</strong> {rule.value}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeRule(rule.id)}
                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
