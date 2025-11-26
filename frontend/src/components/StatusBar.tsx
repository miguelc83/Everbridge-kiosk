/**
 * StatusBar Component - Display internet and Everbridge server connectivity status
 */
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api/client';
import './StatusBar.css';

interface ConnectionStatus {
  internet: boolean;
  everbridge: boolean;
  checking: boolean;
}

export default function StatusBar() {
  const [status, setStatus] = useState<ConnectionStatus>({
    internet: false,
    everbridge: false,
    checking: true,
  });

  useEffect(() => {
    // Check status on mount
    checkConnectivity();

    // Check connectivity every 10 seconds
    const interval = setInterval(() => {
      checkConnectivity();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const checkConnectivity = async () => {
    // Check internet connectivity
    const internetStatus = await checkInternetConnection();
    
    // Check Everbridge server accessibility
    const everbridgeStatus = await checkEverbridgeServer();

    setStatus({
      internet: internetStatus,
      everbridge: everbridgeStatus,
      checking: false,
    });
  };

  const checkInternetConnection = async (): Promise<boolean> => {
    try {
      // Try to reach a reliable endpoint (Google DNS or similar)
      await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        cache: 'no-cache',
      });
      return true;
    } catch (error) {
      console.error('Internet connection check failed:', error);
      return false;
    }
  };

  const checkEverbridgeServer = async (): Promise<boolean> => {
    try {
      // Try to reach the Everbridge API health endpoint
      const response = await fetch(`${API_BASE_URL}/health/everbridge`, {
        method: 'GET',
        cache: 'no-cache',
      });
      return response.ok;
    } catch (error) {
      console.error('Everbridge API check failed:', error);
      return false;
    }
  };

  return (
    <div className="status-bar">
      <div className="status-indicators">
        <div className="status-item">
          <div className={`status-led ${status.checking ? 'status-led-gray' : status.internet ? 'status-led-green' : 'status-led-red'}`} />
          <span className="status-label">Internet</span>
        </div>
        <div className="status-item">
          <div className={`status-led ${status.checking ? 'status-led-gray' : status.everbridge ? 'status-led-green' : 'status-led-red'}`} />
          <span className="status-label">Everbridge</span>
        </div>
      </div>
    </div>
  );
}
