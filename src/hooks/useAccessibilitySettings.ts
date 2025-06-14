
import { useState, useEffect, useCallback } from 'react';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error);
      }
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.setAttribute('data-font-size', settings.fontSize);
    
    // High contrast
    root.setAttribute('data-high-contrast', settings.highContrast.toString());
    
    // Reduced motion
    root.setAttribute('data-reduce-motion', settings.reduceMotion.toString());
    
    // Focus indicators
    root.setAttribute('data-focus-indicators', settings.focusIndicators.toString());

    // Apply CSS custom properties
    switch (settings.fontSize) {
      case 'small':
        root.style.setProperty('--base-font-size', '14px');
        break;
      case 'large':
        root.style.setProperty('--base-font-size', '18px');
        break;
      case 'extra-large':
        root.style.setProperty('--base-font-size', '22px');
        break;
      default:
        root.style.setProperty('--base-font-size', '16px');
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
    };
    setSettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((settingsJson: string) => {
    setIsLoading(true);
    try {
      const importedSettings = JSON.parse(settingsJson);
      setSettings(importedSettings);
      localStorage.setItem('accessibility-settings', JSON.stringify(importedSettings));
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    isLoading
  };
}
