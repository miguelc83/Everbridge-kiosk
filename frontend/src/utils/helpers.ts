/**
 * Utility functions for Everbridge Kiosk
 */
import { CriticalityLevel } from '../types';

/**
 * Get criticality badge color
 */
export const getCriticalityColor = (criticality: CriticalityLevel): string => {
  switch (criticality) {
    case CriticalityLevel.CRITICAL:
      return '#dc2626'; // red-600
    case CriticalityLevel.HIGH:
      return '#ea580c'; // orange-600
    case CriticalityLevel.MEDIUM:
      return '#ca8a04'; // yellow-600
    case CriticalityLevel.LOW:
      return '#16a34a'; // green-600
    default:
      return '#6b7280'; // gray-500
  }
};

/**
 * Get criticality display text
 */
export const getCriticalityText = (criticality: CriticalityLevel): string => {
  switch (criticality) {
    case CriticalityLevel.CRITICAL:
      return 'CRÍTICO';
    case CriticalityLevel.HIGH:
      return 'ALTO';
    case CriticalityLevel.MEDIUM:
      return 'MEDIO';
    case CriticalityLevel.LOW:
      return 'BAJO';
    default:
      return String(criticality).toUpperCase();
  }
};

/**
 * Format date/time for display
 */
export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Replace variables in template text
 */
export const replaceVariables = (
  text: string,
  variables: Record<string, any>
): string => {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
  });
  return result;
};
