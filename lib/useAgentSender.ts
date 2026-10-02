import { useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';
import { toPersianDigits } from './format';

const REPORT_INTERVAL = 30000;

const sampleNames = ['علی رضایی', 'مریم حسینی', 'حسن کریمی', 'زهرا احمدی', 'محمد قاسمی'];
const sampleApps = ['Instagram', 'Telegram', 'WhatsApp', 'YouTube', 'Spotify'];
const sampleMessages = [
  'پیامک از علی: سلام چطوری؟',
  'پیامک از مریم: فردا میایم؟',
  'اعلان از واتس‌اپ: پیام جدید',
  'پیامک از بانک: تراکنش موفق',
  'اعلان از اینستاگرام: لایک جدید',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  let num = '0912';
  for (let i = 0; i < 7; i++) num += Math.floor(Math.random() * 10);
  return num;
}

export function useAgentSender(deviceId: string | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendHeartbeat = useCallback(async () => {
    if (!deviceId) return;
    await supabase.from('devices').update({
      is_online: true,
      last_seen: new Date().toISOString(),
    }).eq('id', deviceId);
  }, [deviceId]);

  const sendRandomActivity = useCallback(async () => {
    if (!deviceId) return;
    const types = ['call', 'message', 'notification', 'data_sync'];
    const type = randomFrom(types);
    const isIncoming = Math.random() > 0.5;
    const source = type === 'call' ? randomFrom(sampleNames) : type === 'message' ? randomFrom(sampleNames) : randomFrom(sampleApps);
    const description = type === 'message' ? randomFrom(sampleMessages) : type === 'call' ? `${isIncoming ? 'تماس ورودی' : 'تماس خروجی'} از ${source}` : `اعلان از ${source}`;

    await supabase.from('device_activity').insert({
      type,
      direction: isIncoming ? 'incoming' : 'outgoing',
      source,
      description,
      status: 'success',
      duration: type === 'call' ? Math.floor(Math.random() * 300) + 10 : null,
      data_size: type === 'data_sync' ? Math.floor(Math.random() * 50000000) + 1000000 : null,
      device_id: deviceId,
    });
  }, [deviceId]);

  const sendDeviceInfo = useCallback(async () => {
    if (!deviceId) return;
    const battery = Math.floor(Math.random() * 20) + 70;
    const cpu = Math.floor(Math.random() * 30) + 20;
    const info: Record<string, string> = {
      battery_level: String(battery),
      cpu_usage: String(cpu),
      cpu_temp: String(Math.floor(Math.random() * 15) + 30),
      ram_used: String(Math.floor(Math.random() * 3000000000) + 5000000000),
      storage_used: String(Math.floor(Math.random() * 50000000000) + 150000000000),
      wifi_connected: 'true',
      bluetooth_enabled: Math.random() > 0.5 ? 'true' : 'false',
      location_enabled: 'true',
      signal_strength: String(Math.floor(Math.random() * 2) + 3),
    };

    for (const [key, value] of Object.entries(info)) {
      await supabase.from('device_info').upsert(
        { key, value, updated_at: new Date().toISOString(), device_id: deviceId },
        { onConflict: 'key' }
      );
    }
  }, [deviceId]);

  const checkForCommands = useCallback(async () => {
    if (!deviceId) return;
    const { data: commands } = await supabase
      .from('remote_commands')
      .select('*')
      .eq('device_id', deviceId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (commands && commands.length > 0) {
      for (const cmd of commands) {
        const results: Record<string, string> = {
          lock: 'دستگاه قفل شد',
          ring: 'دستگاه به صدا درآمد',
          location: `lat: ${(Math.random() * 0.1 + 35.6).toFixed(4)}, lng: ${(Math.random() * 0.1 + 51.3).toFixed(4)}`,
          screenshot: 'اسکرین‌شات گرفته شد',
          message: 'پیام نمایش داده شد',
          reboot: 'دستگاه راه‌اندازی شد',
          wipe: 'دستور پاک کردن اجرا شد',
          clear_cache: 'حافظه پنهان پاک شد',
          scan: 'اسکن انجام شد - مشکلی یافت نشد',
          backup: 'پشتیبان‌گیری انجام شد',
        };
        await supabase.from('remote_commands').update({
          status: 'completed',
          result: results[cmd.command_type] || 'دستور اجرا شد',
          executed_at: new Date().toISOString(),
        }).eq('id', cmd.id);
      }
    }
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;

    sendHeartbeat();
    sendDeviceInfo();
    sendRandomActivity();
    checkForCommands();

    intervalRef.current = setInterval(() => {
      sendHeartbeat();
      if (Math.random() > 0.5) sendRandomActivity();
      if (Math.random() > 0.7) sendDeviceInfo();
      checkForCommands();
    }, REPORT_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [deviceId, sendHeartbeat, sendDeviceInfo, sendRandomActivity, checkForCommands]);
}
