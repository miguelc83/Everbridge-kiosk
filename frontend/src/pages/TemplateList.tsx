/**
 * TemplateList Component - Display all available notification templates
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { NotificationTemplate } from '../types';
import { getCriticalityColor, getCriticalityText } from '../utils/helpers';
import './TemplateList.css';

export default function TemplateList() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Error al cargar las plantillas. Por favor, intente nuevamente.');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (templateId: string) => {
    navigate(`/template/${templateId}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Cargando plantillas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadTemplates}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Kiosko Everbridge</h1>
        <p className="subtitle">Seleccione una plantilla de notificación de emergencia</p>
      </header>

      <div className="template-grid">
        {templates.map((template) => (
          <div
            key={template.id}
            className="template-card"
            onClick={() => handleTemplateClick(template.id)}
          >
            <div className="template-header">
              <h2>{template.name}</h2>
              <span
                className="criticality-badge"
                style={{ backgroundColor: getCriticalityColor(template.criticality) }}
              >
                {getCriticalityText(template.criticality)}
              </span>
            </div>
            {template.description && (
              <p className="template-description">{template.description}</p>
            )}
            <div className="template-footer">
              <span className="contact-paths">
                {template.contact_paths?.join(', ') || 'Sin canales configurados'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="empty-state">
          <p>No hay plantillas disponibles</p>
        </div>
      )}
    </div>
  );
}
