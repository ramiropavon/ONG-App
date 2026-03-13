import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets, Wind, Zap, Activity, AlertCircle } from 'lucide-react';
import { PulseClient } from '../lib/pulse';
import './PulseWidget.css'; // O podés meter los estilos en Dashboard.css

const PulseWidget = () => {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPulseData = async () => {
      try {
        setLoading(true);
        const apiKey = import.meta.env.VITE_PULSE_API_KEY;
        
        if (!apiKey) {
          throw new Error('API Key de Pulse no configurada');
        }

        const pulse = new PulseClient(apiKey);
        
        // Primero traemos todos los dispositivos para sacar el ID del primero
        const devices = await pulse.getAllDevices();
        
        if (!devices || devices.length === 0) {
          throw new Error('No se encontraron dispositivos asociados a esta cuenta');
        }

        const deviceId = devices[0].id;
        
        // Buscamos la info reciente de este dispositivo en particular
        const data = await pulse.getDeviceRecentData(deviceId);
        
        setDeviceData({
          name: devices[0].name || 'Pulse Pro',
          ...data
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPulseData();
    // Podés configurar para refrescar cada X minutos si querés
    const tempInterval = setInterval(fetchPulseData, 10 * 60 * 1000); 
    return () => clearInterval(tempInterval);
  }, []);

  if (loading && !deviceData) {
    return (
      <div className="pulse-widget pulse-loading">
        <Activity className="spin" size={24} />
        <span>Conectando con Pulse Pro...</span>
      </div>
    );
  }

  if (error && !deviceData) {
    return (
      <div className="pulse-widget pulse-error">
        <AlertCircle size={24} />
        <span>Error de Pulse: {error}</span>
      </div>
    );
  }

  // Si tenemos data, la mostramos
  return (
    <div className="pulse-widget">
      <div className="pulse-header">
        <div className="pulse-title">
          <Activity size={20} color="#06d6a0" />
          <h4>En Vivo: {deviceData.name}</h4>
        </div>
        <span className="pulse-timestamp">
          {new Date(deviceData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="pulse-metrics">
        <div className="pulse-metric-item">
          <Thermometer size={18} color="#ffb703" />
          <div className="metric-info">
            <span className="metric-val">{deviceData.temperature?.toFixed(1)}°C</span>
            <span className="metric-label">Temp</span>
          </div>
        </div>
        
        <div className="pulse-metric-item">
          <Droplets size={18} color="#4cc9f0" />
          <div className="metric-info">
            <span className="metric-val">{deviceData.humidity?.toFixed(1)}%</span>
            <span className="metric-label">Humedad</span>
          </div>
        </div>

        <div className="pulse-metric-item">
          <Wind size={18} color="#f72585" />
          <div className="metric-info">
            <span className="metric-val">{deviceData.vpd?.toFixed(2)}</span>
            <span className="metric-label">VPD</span>
          </div>
        </div>
        
        <div className="pulse-metric-item">
          <Zap size={18} color="#e0aaff" />
          <div className="metric-info">
            <span className="metric-val">{deviceData.light?.toFixed(0) || 0}</span>
            <span className="metric-label">Lux</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulseWidget;
