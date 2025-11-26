/**
 * TemplateDetail Component - Display template details and handle confirmations
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { NotificationTemplate, ConfirmationResponse } from '../types';
import { getCriticalityColor, getCriticalityText, replaceVariables } from '../utils/helpers';
import './TemplateDetail.css';

export default function TemplateDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmationState, setConfirmationState] = useState<ConfirmationResponse | null>(null);
  const [confirmationCount, setConfirmationCount] = useState(0);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  useEffect(() => {
    // Initialize variables from template
    if (template && template.variables) {
      const initialVars: Record<string, string> = {};
      Object.keys(template.variables).forEach(key => {
        initialVars[key] = '';
      });
      setVariables(initialVars);
    }
  }, [template]);

  const loadTemplate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTemplate(id);
      setTemplate(data);
    } catch (err) {
      setError('Error al cargar la plantilla. Por favor, intente nuevamente.');
      console.error('Error loading template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirm = async () => {
    if (!template || !templateId) return;

    try {
      const response = await api.confirmNotification(templateId, {
        template_id: templateId,
        variables,
        confirmation_count: confirmationCount,
      });

      setConfirmationState(response);
      setConfirmationCount(response.current_confirmations);

      if (response.can_proceed) {
        // After all confirmations, send the notification
        await handleSend();
      }
    } catch (err) {
      setError('Error en el proceso de confirmación.');
      console.error('Error confirming:', err);
    }
  };

  const handleSend = async () => {
    if (!templateId) return;

    try {
      setSending(true);
      const result = await api.sendNotification({
        template_id: templateId,
        variables,
        confirmation_count: confirmationCount,
      });

      // Navigate to status page
      navigate(`/status/${result.id}`);
    } catch (err) {
      setError('Error al enviar la notificación.');
      console.error('Error sending notification:', err);
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleReset = () => {
    setConfirmationCount(0);
    setConfirmationState(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Cargando plantilla...</div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="container">
        <div className="error">
          <p>{error}</p>
          <button onClick={handleCancel}>Volver</button>
        </div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  const messagePreview = template.message_body
    ? replaceVariables(template.message_body, variables)
    : '';

  const hasVariables = template.variables && Object.keys(template.variables).length > 0;
  const allVariablesFilled = hasVariables
    ? Object.keys(variables).every(key => variables[key].trim() !== '')
    : true;

  return (
    <div className="container">
      <div className="detail-header">
        <button className="back-button" onClick={handleCancel}>
          ← Volver
        </button>
        <h1>{template.name}</h1>
        <span
          className="criticality-badge"
          style={{ backgroundColor: getCriticalityColor(template.criticality) }}
        >
          {getCriticalityText(template.criticality)}
        </span>
      </div>

      <div className="detail-content">
        {template.description && (
          <div className="section">
            <h2>Descripción</h2>
            <p>{template.description}</p>
          </div>
        )}

        {template.message_subject && (
          <div className="section">
            <h2>Asunto</h2>
            <p className="message-subject">{template.message_subject}</p>
          </div>
        )}

        {hasVariables && (
          <div className="section">
            <h2>Variables del Mensaje</h2>
            <div className="variables-form">
              {Object.keys(template.variables!).map(key => (
                <div key={key} className="form-group">
                  <label htmlFor={key}>{key}:</label>
                  <input
                    id={key}
                    type="text"
                    value={variables[key] || ''}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    placeholder={`Ingrese ${key}`}
                    disabled={confirmationCount > 0}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <h2>Vista Previa del Mensaje</h2>
          <div className="message-preview">
            {messagePreview || 'Sin mensaje configurado'}
          </div>
        </div>

        <div className="section">
          <h2>Canales de Contacto</h2>
          <div className="contact-paths-list">
            {template.contact_paths?.map(path => (
              <span key={path} className="contact-path-tag">
                {path}
              </span>
            )) || <span>Sin canales configurados</span>}
          </div>
        </div>

        {confirmationState && (
          <div className="confirmation-status">
            <p className="confirmation-message">{confirmationState.message}</p>
            <div className="confirmation-progress">
              {Array.from({ length: confirmationState.required_confirmations }).map((_, idx) => (
                <div
                  key={idx}
                  className={`confirmation-dot ${
                    idx < confirmationState.current_confirmations ? 'active' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="actions">
          {confirmationCount === 0 ? (
            <>
              <button className="cancel-button" onClick={handleCancel}>
                Cancelar
              </button>
              <button
                className="confirm-button"
                onClick={handleConfirm}
                disabled={!allVariablesFilled}
              >
                Continuar
              </button>
            </>
          ) : (
            <>
              <button className="reset-button" onClick={handleReset}>
                Reiniciar
              </button>
              <button
                className="confirm-button"
                onClick={handleConfirm}
                disabled={sending}
              >
                {sending ? 'Enviando...' : 'Confirmar'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
