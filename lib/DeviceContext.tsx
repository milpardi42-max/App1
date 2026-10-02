import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import type { Device } from './types';
import * as Storage from './storage';

interface DeviceContextValue {
  devices: Device[];
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;
  loading: boolean;
  reload: () => void;
}

const DeviceContext = createContext<DeviceContextValue>({
  devices: [],
  selectedDeviceId: null,
  setSelectedDeviceId: () => {},
  loading: true,
  reload: () => {},
});

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('devices').select('*').order('created_at', { ascending: false });
    setDevices((data as Device[]) || []);
    setLoading(false);

    const saved = await Storage.getSelectedDeviceId();
    if (saved && (data as Device[])?.some((d) => d.id === saved)) {
      setSelectedDeviceIdState(saved);
    } else if ((data as Device[]) && (data as Device[]).length > 0) {
      const first = (data as Device[])[0].id;
      setSelectedDeviceIdState(first);
      await Storage.setSelectedDeviceId(first);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setSelectedDeviceId = useCallback(async (id: string | null) => {
    setSelectedDeviceIdState(id);
    if (id) await Storage.setSelectedDeviceId(id);
  }, []);

  return (
    <DeviceContext.Provider value={{ devices, selectedDeviceId, setSelectedDeviceId, loading, reload: load }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDeviceContext() {
  return useContext(DeviceContext);
}
