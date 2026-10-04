import { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Share, Linking, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Smartphone,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Package,
  Zap,
} from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { toPersianDigits } from '@/lib/format';

const AGENT_ROUTE = '/agent';
const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=';

export default function ShareScreen() {
  const router = useRouter();
  const [appUrl, setAppUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const base = window.location.origin;
      const url = `${base}${AGENT_ROUTE}`;
      setAppUrl(url);
      setQrUrl(`${QR_API}${encodeURIComponent(url)}`);
    } else {
      const url = `https://your-app-url.com${AGENT_ROUTE}`;
      setAppUrl(url);
      // On native, the URL is a placeholder — but a non-empty URI is still
      // required for the QR image to render.
      setQrUrl(`${QR_API}${encodeURIComponent(url)}`);
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        await Share.share({
          message: `برنامه گوشی دوم را از این آدرس باز کنید:\n${appUrl}`,
          url: appUrl,
        });
      } else {
        // On native, `url` opens the file/URL directly after sharing — only
        // share it as a text message here.
        await Share.share({
          message: `برنامه گوشی دوم را از این آدرس باز کنید:\n${appUrl}`,
        });
      }
    } catch {
      // noop
    }
  }, [appUrl]);

  const handleCopy = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [appUrl]);

  const handleOpen = useCallback(() => {
    if (Platform.OS !== 'web') {
      // Inside the installed app, no need for an external URL —
      // just navigate straight to the pairing screen that's already built in.
      router.push(AGENT_ROUTE);
      return;
    }
    if (typeof window !== 'undefined') {
      window.open(appUrl, '_blank');
    } else {
      Linking.openURL(appUrl);
    }
  }, [appUrl, router]);

  return (
    <ScrollView style={styles.screen}>
      <ScreenHeader
        title="دریافت اپ گوشی دوم"
        subtitle="نصب و فعال‌سازی برنامه روی دستگاه دیگر"
        icon={Smartphone}
      />

      <View style={styles.body}>
        {/* Hero Card */}
        <LinearGradient
          colors={[Colors.primary[600], Colors.accent[800]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroIconWrap}>
            <Smartphone size={32} color={Colors.onColor} strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>برنامه گوشی دوم</Text>
          <Text style={styles.heroDesc}>
            برنامه سبک و کم‌حجم که روی گوشی دوم نصب می‌شود و اطلاعات آن را به پنل مدیریت ارسال می‌کند
          </Text>
        </LinearGradient>

        {/* QR Code Section */}
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <QrCode size={20} color={Colors.accent[400]} strokeWidth={2} />
            <Text style={styles.qrTitle}>اسکن برای نصب</Text>
          </View>
          <Text style={styles.qrDesc}>
            با دوربین گوشی دوم، این QR کد را اسکن کنید تا برنامه باز شود
          </Text>
          <View style={styles.qrWrap}>
            {qrUrl ? (
              <Image
                source={{ uri: qrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <QrCode size={80} color={Colors.neutral[600]} strokeWidth={1} />
              </View>
            )}
          </View>
          <View style={styles.qrBadge}>
            <Zap size={14} color={Colors.warning[400]} strokeWidth={2} />
            <Text style={styles.qrBadgeText}>سبک و سریع - کمتر از ۱ مگابایت</Text>
          </View>
        </View>

        {/* URL Section */}
        <View style={styles.urlCard}>
          <Text style={styles.urlLabel}>آدرس مستقیم برنامه:</Text>
          <View style={styles.urlRow}>
            <Text style={styles.urlText} numberOfLines={1} selectable>{appUrl}</Text>
          </View>
          <View style={styles.urlActions}>
            <Pressable style={styles.urlBtn} onPress={handleCopy}>
              <Copy size={16} color={Colors.accent[400]} strokeWidth={2} />
              <Text style={styles.urlBtnText}>{copied ? 'کپی شد!' : 'کپی آدرس'}</Text>
            </Pressable>
            <Pressable style={styles.urlBtn} onPress={handleOpen}>
              <ExternalLink size={16} color={Colors.primary[400]} strokeWidth={2} />
              <Text style={styles.urlBtnText}>باز کردن</Text>
            </Pressable>
            <Pressable style={styles.urlBtn} onPress={handleShare}>
              <Share2 size={16} color={Colors.success[400]} strokeWidth={2} />
              <Text style={styles.urlBtnText}>اشتراک‌گذاری</Text>
            </Pressable>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>مراحل نصب و فعال‌سازی</Text>
          <StepItem
            num={1}
            icon={QrCode}
            title="اسکن QR کد"
            desc="با دوربین گوشی دوم، QR کد بالا را اسکن کنید"
          />
          <StepItem
            num={2}
            icon={Download}
            title="باز کردن برنامه"
            desc="لینک باز شده را در مرورگر گوشی دوم باز کنید"
          />
          <StepItem
            num={3}
            icon={Smartphone}
            title="جفت‌سازی"
            desc="کد جفت‌سازی ۶ رقمی را از پنل مدیریت دریافت و وارد کنید"
          />
          <StepItem
            num={4}
            icon={CheckCircle2}
            title="اتصال کامل"
            desc="برنامه شروع به ارسال اطلاعات به پنل مدیریت می‌کند"
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Info size={18} color={Colors.warning[400]} strokeWidth={2} />
            <Text style={styles.infoTitle}>ویژگی‌های برنامه گوشی دوم</Text>
          </View>
          <FeatureItem icon={Zap} text="بسیار سبک و کم‌حجم - بدون تب‌بار یا منو" />
          <FeatureItem icon={Package} text="فقط یک صفحه ساده برای جفت‌سازی" />
          <FeatureItem icon={Smartphone} text="ارسال خودکار اطلاعات تماس، پیام، برنامه و وضعیت دستگاه" />
          <FeatureItem icon={CheckCircle2} text="اجرای دستورات از راه دور پنل مدیریت" />
        </View>
      </View>
    </ScrollView>
  );
}

function StepItem({ num, icon: Icon, title, desc }: { num: number; icon: typeof QrCode; title: string; desc: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepLeft}>
        <View style={styles.stepNumWrap}>
          <Text style={styles.stepNum}>{toPersianDigits(num)}</Text>
        </View>
        <View style={styles.stepConnector} />
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Icon size={16} color={Colors.accent[400]} strokeWidth={2} />
          <Text style={styles.stepTitle}>{title}</Text>
        </View>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: typeof Zap; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconWrap}>
        <Icon size={14} color={Colors.success[400]} strokeWidth={2} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  body: { padding: Spacing.md, paddingBottom: 100 },
  heroCard: { borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md },
  heroIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  heroTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.onColor, textAlign: 'center' },
  heroDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  qrCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  qrHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  qrTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  qrDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 20 },
  qrWrap: { backgroundColor: Colors.onColor, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  qrImage: { width: 220, height: 220 },
  qrPlaceholder: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center' },
  qrBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.warning[500] + '15', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  qrBadgeText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.warning[400], fontWeight: Typography.weights.medium },
  urlCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  urlLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], marginBottom: Spacing.sm },
  urlRow: { backgroundColor: Colors.neutral[900], borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  urlText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.accent[300], textAlign: 'left' },
  urlActions: { flexDirection: 'row', gap: Spacing.sm },
  urlBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.neutral[900], borderRadius: Radius.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.neutral[800] },
  urlBtnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[200], fontWeight: Typography.weights.medium },
  stepsCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  stepsTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0], marginBottom: Spacing.lg },
  stepItem: { flexDirection: 'row', marginBottom: Spacing.md },
  stepLeft: { alignItems: 'center', marginRight: Spacing.md },
  stepNumWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent[500] + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.accent[500] + '40' },
  stepNum: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.accent[400] },
  stepConnector: { width: 2, flex: 1, backgroundColor: Colors.neutral[800], marginTop: 4, minHeight: 20 },
  stepContent: { flex: 1, paddingBottom: Spacing.sm },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  stepTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  stepDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], lineHeight: 20 },
  infoCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  infoTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  featureIconWrap: { width: 24, height: 24, borderRadius: 6, backgroundColor: Colors.success[500] + '15', justifyContent: 'center', alignItems: 'center' },
  featureText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[300], flex: 1, lineHeight: 20 },
});
