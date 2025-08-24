import React, { useEffect, useState } from 'react';
import api from '../api'; // Adjust path if necessary

const Settings = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/settings/');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="container">
      <h2>⚙️ Settings</h2>
      {Object.keys(settings).length === 0 ? (
        <p>No settings available to display.</p>
      ) : (
        <ul className="list-group">
          {Object.entries(settings).map(([key, value]) => (
            <li key={key} className="list-group-item d-flex justify-content-between">
              <span>{key}</span>
              <strong>{String(value)}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Settings;
