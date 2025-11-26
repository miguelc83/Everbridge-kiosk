/**
 * StatusBar Component - Display internet and Everbridge server connectivity status
 */
import { useEffect, useState } from 'react';
import './StatusBar.css';

interface ConnectionStatus {
  internet: boolean;
  everbridge: boolean;
}

export default function StatusBar() {
  const [status, setStatus] = useState<ConnectionStatus>({
    internet: true,
    everbridge: true,
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
      // Try to reach the backend health endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/health`, {
        method: 'GET',
        cache: 'no-cache',
      });
      return response.ok;
    } catch (error) {
      console.error('Everbridge server check failed:', error);
      return false;
    }
  };

  return (
    <div className="status-bar">
      <div className="status-indicators">
        <div className="status-item">
          <div className={`status-led ${status.internet ? 'status-led-green' : 'status-led-red'}`} />
          <span className="status-label">Internet</span>
        </div>
        <div className="status-item">
          <div className={`status-led ${status.everbridge ? 'status-led-green' : 'status-led-red'}`} />
          <span className="status-label">Everbridge</span>
        </div>
      </div>
    </div>
  );
}
