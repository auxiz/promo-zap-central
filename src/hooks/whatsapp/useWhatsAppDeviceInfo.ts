
import { useState } from 'react';

export interface DeviceInfo {
  name: string;
  lastConnection: string;
}

export function useWhatsAppDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({ 
    name: '', 
    lastConnection: '' 
  });
  
  const updateDeviceInfo = (deviceName?: string) => {
    if (deviceName) {
      setDeviceInfo({
        name: `WhatsApp (${deviceName})`,
        lastConnection: new Date().toLocaleString()
      });
    }
  };
  
  return {
    deviceInfo,
    updateDeviceInfo,
    setDeviceInfo
  };
}
