import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link2, ShieldCheck, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { toPersianDigits } from '@/lib/format';
import type { Device } from '@/lib/types';
import * as Storage from '@/lib/storage';
import { useAgentSender } from '@/lib/useAgentSender';

export default function AgentHome() {
  const [step, setStep] = useState<'loading' | 'pair' | 'paired'>('loading');
  const [pairCode, setPairCode] = useState('');
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await Storage.getDeviceId();
      if (saved) {
        const { data } = await supabase.from('devices').select('*').eq('id', saved).maybeSingle();
        if (data) {
          setDevice(data as Device);
          setStep('paired');
          return;
        }
      }
      setStep('pair');
    })();
  }, []);

  const handlePair = useCallback(async () => {
    if (pairCode.length !== 6) {
      setError('کد جفت‌سازی باید ۶ رقم باشد');
      return;
    }
    setSubmitting(true);
    setError('');

    const { data, error: queryError } = await supabase
      .from('devices')
      .select('*')
      .eq('pairing_code', pairCode)
      .maybeSingle();

    if (queryError || !data) {
      setError('کد جفت‌سازی یافت نشد. لطفاً کد را بررسی کنید.');
      setSubmitting(false);
      return;
    }

    const deviceData = data as Device;
    if (deviceData.is_paired) {
      setError('این دستگاه قبلاً جفت‌سازی شده است.');
      setSubmitting(false);
      return;
    }

    const { data: updated } = await supabase
      .from('devices')
      .update({
        is_paired: true,
        is_online: true,
        last_seen: new Date().toISOString(),
        device_name: deviceData.device_name,
      })
      .eq('id', deviceData.id)
      .select('*')
      .single();

    if (updated) {
      const d = updated as Device;
      setDevice(d);
      await Storage.setDeviceId(d.id);
      setStep('paired');
    }
    setSubmitting(false);
  }, [pairCode]);

  useAgentSender(device?.id || null);

  const handleUnpair = useCallback(async () => {
    if (!device) return;
    await supabase.from('devices').update({ is_paired: false, is_online: false }).eq('id', device.id);
    await Storage.clearDeviceId();
    setDevice(null);
    setStep('pair');
    setPairCode('');
  }, [device]);

  if (step === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent[400]} />
      </View>
    );
  }

  if (step === 'paired' && device) {
    return (
      <ScrollView style={styles.screen}>
        <View style={styles.pairedBody}>
          <View style={styles.pairedHeader}>
            <View style={styles.pairedIconWrap}>
              <CheckCircle2 size={40} color={Colors.success[400]} strokeWidth={2} />
            </View>
            <Text style={styles.pairedTitle}>دستگاه متصل است</Text>
            <Text style={styles.pairedSub}>{device.device_name}</Text>
          </View>

          <View style={styles.infoCard}>
            <InfoRow label="نام دستگاه" value={device.device_name} />
            <InfoRow label="مدل" value={device.device_model || 'نامشخص'} />
            <InfoRow label="سیستم عامل" value={device.os_version || 'نامشخص'} />
            <InfoRow label="شماره تلفن" value={toPersianDigits(device.phone_number || 'نامشخص')} />
            <InfoRow label="وضعیت" value="آنلاین و فعال" />
          </View>

          <View style={styles.statusCard}>
            <ShieldCheck size={20} color={Colors.success[400]} strokeWidth={2} />
            <Text style={styles.statusText}>داده‌های دستگاه در حال ارسال به پنل مدیریت است</Text>
          </View>

          <Pressable style={styles.unpairBtn} onPress={handleUnpair}>
            <Text style={styles.unpairText}>قطع اتصال دستگاه</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.pairBody}>
        <View style={styles.pairHeader}>
          <View style={styles.pairIconWrap}>
            <Link2 size={36} color={Colors.accent[400]} strokeWidth={2} />
          </View>
          <Text style={styles.pairTitle}>جفت‌سازی دستگاه</Text>
          <Text style={styles.pairDesc}>
            برای اتصال این گوشی به پنل مدیریت، کد جفت‌سازی ۶ رقمی را از پنل مدیریت دریافت کرده و وارد کنید.
          </Text>
        </View>

        <View style={styles.codeInputWrap}>
          <TextInput
            style={styles.codeInput}
            placeholder="------"
            placeholderTextColor={Colors.neutral[600]}
            value={pairCode}
            onChangeText={(t) => { setPairCode(t.replace(/[^0-9]/g, '').slice(0, 6)); setError(''); }}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={Colors.error[400]} strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable style={styles.pairBtn} onPress={handlePair} disabled={submitting}>
          <LinearGradient colors={[Colors.accent[500], Colors.accent[700]]} style={styles.pairBtnGradient}>
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.neutral[0]} />
            ) : (
              <>
                <Link2 size={18} color={Colors.neutral[0]} strokeWidth={2} />
                <Text style={styles.pairBtnText}>اتصال به پنل مدیریت</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.hintCard}>
          <Smartphone size={16} color={Colors.neutral[500]} strokeWidth={2} />
          <Text style={styles.hintText}>
            پس از اتصال، اطلاعات تماس‌ها، پیام‌ها، برنامه‌ها و وضعیت دستگاه به صورت خودکار به پنل مدیریت ارسال می‌شود.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.neutral[950] },
  center: { flex: 1, backgroundColor: Colors.neutral[950], justifyContent: 'center', alignItems: 'center' },
  pairBody: { padding: Spacing.xl, paddingTop: 60, alignItems: 'center' },
  pairHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  pairIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.accent[500] + '20', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  pairTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  pairDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[400], textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  codeInputWrap: { width: '100%', marginBottom: Spacing.md },
  codeInput: {
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.error[500] + '15', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, marginBottom: Spacing.md },
  errorText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.error[400], flex: 1 },
  pairBtn: { width: '100%', borderRadius: Radius.lg, overflow: 'hidden' },
  pairBtnGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  pairBtnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  hintCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.xl, width: '100%' },
  hintText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], flex: 1, lineHeight: 20 },
  pairedBody: { padding: Spacing.lg, paddingTop: 60, alignItems: 'center' },
  pairedHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  pairedIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.success[500] + '20', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  pairedTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  pairedSub: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[400], marginTop: Spacing.xs },
  infoCard: { width: '100%', backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.neutral[800] },
  infoLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[400] },
  infoValue: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: Colors.neutral[0] },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.success[500] + '15', borderRadius: Radius.lg, padding: Spacing.md, width: '100%', marginBottom: Spacing.xl },
  statusText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.success[400], flex: 1, lineHeight: 20 },
  unpairBtn: { backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderWidth: 1, borderColor: Colors.error[500] + '30' },
  unpairText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: Colors.error[400] },
});
