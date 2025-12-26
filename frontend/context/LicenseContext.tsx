import React, { createContext, useContext, useState, useEffect } from 'react';
import { LicenseData, Addons } from '../types';
import { licenseService } from '../services/api';

interface LicenseContextType {
  license: LicenseData | null;
  loading: boolean;
  refreshLicense: () => void;
  updateAddon: (key: keyof Addons, value: boolean) => void;
  extendLicense: () => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) throw new Error('useLicense must be used within a LicenseProvider');
  return context;
};

const MOCK_LICENSE: LicenseData = {
  status: 'OK',
  plan: 'PRO',
  days_left: 6,
  addons: {
    manufacturing: false,
    restaurant: false,
    plus_advance: false,
    custom_branding: false
  }
};

export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshLicense = async () => {
    try {
      setLoading(true);
      const data = await licenseService.getLicense();
      setLicense(data);
    } catch (error) {
      console.error('Failed to load license:', error);
      // Fallback
      setLicense(MOCK_LICENSE);
    } finally {
      setLoading(false);
    }
  };

  const updateAddon = async (key: keyof Addons, value: boolean) => {
    try {
      // Optimistic update
      if (license) {
        setLicense({ ...license, addons: { ...license.addons, [key]: value } });
      }
      const updated = await licenseService.updateAddon(key, value);
      setLicense(updated);
    } catch (error) {
      console.error(error);
      refreshLicense(); // Revert on error
    }
  };

  const extendLicense = async () => {
    try {
      // Optimistic
      if (license) {
        setLicense({ ...license, days_left: 30, status: 'OK' as const });
      }
      const updated = await licenseService.extendLicense();
      setLicense(updated);
    } catch (error) { console.error(error); }
  }

  useEffect(() => { refreshLicense(); }, []);

  return (
    <LicenseContext.Provider value={{ license, loading, refreshLicense, updateAddon, extendLicense }}>
      {children}
    </LicenseContext.Provider>
  );
};
