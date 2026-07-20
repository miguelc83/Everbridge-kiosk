/**
 * NotificationStatus Component - Display notification status and delivery statistics
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { NotificationStatus as NotificationStatusType } from '../types';
import { formatDateTime } from '../utils/helpers';
import './NotificationStatus.css';

export default function NotificationStatus() {
  const { notificationId } = useParams<{ notificationId: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<NotificationStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (notificationId) {
      loadStatus(notificationId);
    }
  }, [notificationId]);

  useEffect(() => {
    if (!autoRefresh || !notificationId) return;

    const interval = setInterval(() => {
      loadStatus(notificationId);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, notificationId]);

  const loadStatus = async (id: string) => {
    try {
      if (loading) {
        setError(null);
      }
      const data = await api.getNotificationStatus(id);
      setStatus(data);
      setLoading(false);
    } catch (err) {
      if (loading) {
        setError('Error al cargar el estado de la notificación.');
        console.error('Error loading status:', err);
        setLoading(false);
      }
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getStatusText = (statusValue: string): string => {
    switch (statusValue.toLowerCase()) {
      case 'sent':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'failed':
        return 'Fallido';
      case 'pending':
        return 'Pendiente';
      default:
        return statusValue;
    }
  };

  const getStatusColor = (statusValue: string): string => {
    switch (statusValue.toLowerCase()) {
      case 'sent':
        return '#ca8a04'; // yellow
      case 'delivered':
        return '#16a34a'; // green
      case 'failed':
        return '#dc2626'; // red
      case 'pending':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Cargando estado de la notificación...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <p>{error}</p>
          <button onClick={handleBackToHome}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const deliveryRate = status.recipients_count && status.recipients_count > 0
    ? ((status.delivered_count || 0) / status.recipients_count * 100).toFixed(1)
    : '0';

  return (
    <div className="container">
      <div className="status-header">
        <h1>Estado de la Notificación</h1>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(status.status) }}
        >
          {getStatusText(status.status)}
        </span>
      </div>

      <div className="status-content">
        <div className="info-section">
          <div className="info-item">
            <span className="info-label">ID de Notificación:</span>
            <span className="info-value">{status.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Plantilla:</span>
            <span className="info-value">{status.template_name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Enviado:</span>
            <span className="info-value">{formatDateTime(status.sent_at)}</span>
          </div>
        </div>

        <div className="statistics-section">
          <h2>Estadísticas de Entrega</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{status.recipients_count || 0}</div>
              <div className="stat-label">Destinatarios</div>
            </div>
            <div className="stat-card delivered">
              <div className="stat-value">{status.delivered_count || 0}</div>
              <div className="stat-label">Entregados</div>
            </div>
            <div className="stat-card failed">
              <div className="stat-value">{status.failed_count || 0}</div>
              <div className="stat-label">Fallidos</div>
            </div>
            <div className="stat-card rate">
              <div className="stat-value">{deliveryRate}%</div>
              <div className="stat-label">Tasa de Entrega</div>
            </div>
          </div>
        </div>

        {status.details && Object.keys(status.details).length > 0 && (
          <div className="details-section">
            <h2>Detalles Adicionales</h2>
            <div className="details-grid">
              {Object.entries(status.details).map(([key, value]) => (
                <div key={key} className="detail-item">
                  <span className="detail-key">{key}:</span>
                  <span className="detail-value">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="refresh-section">
          <label className="refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Actualización automática (cada 5 segundos)
          </label>
        </div>

        <div className="actions">
          <button className="home-button" onClick={handleBackToHome}>
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
