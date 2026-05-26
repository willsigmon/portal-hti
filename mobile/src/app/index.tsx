import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Linking, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { storage } from '@/lib/storage';
import { fetchEventSummary } from '@/lib/event-api';
import { Calendar, MapPin, Laptop, Sparkles, Ticket, Shield } from 'lucide-react-native';

import StarfieldBackdrop from '@/components/StarfieldBackdrop';
import { Spacing, BottomTabInset } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [stats, setStats] = useState({ pledges: 0, wiped: 0, progress: 0 });

  // 1. Live Countdown Calculation to June 11, 2026 18:00
  useEffect(() => {
    const targetDate = new Date('2026-06-12T18:00:00-04:00').getTime(); // Eastern Time

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, mins, secs });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load Local Pledges Statistics
  const loadPledgeStats = async () => {
    try {
      const summary = await fetchEventSummary();
      setStats({
        pledges: summary.pledgedDevices,
        wiped: summary.receivedDevices,
        progress: summary.progress,
      });
      return;
    } catch {
      // Offline companion mode falls back to locally submitted pledges.
    }

    try {
      const stored = await storage.getItem('ss_pledges');
      if (stored) {
        const pledgeList = JSON.parse(stored);
        const count = pledgeList.reduce((sum: number, p: any) => sum + parseInt(p.quantity || p.count || 1, 10), 0);
        setStats({
          pledges: count,
          wiped: 0,
          progress: Math.min(100, (count / 150) * 100),
        });
      } else {
        setStats({ pledges: 0, wiped: 0, progress: 0 });
      }
    } catch (e) {
      console.log('Error loading local stats', e);
    }
  };

  // Sync on screen focus
  useEffect(() => {
    loadPledgeStats();
    // Periodically sync stats
    const interval = setInterval(loadPledgeStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const openDirections = () => {
    Linking.openURL('https://maps.google.com/?q=Portal+HQ+Raleigh');
  };

  return (
    <View style={styles.container}>
      <StarfieldBackdrop />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Banner */}
          <View style={styles.heroSection}>
            <View style={styles.liveBadge}>
              <Sparkles size={12} color="#f58420" />
              <Text style={styles.liveBadgeText}>Sip & Sync 2026</Text>
            </View>
            <Text style={styles.heroTitle}>Sip & Sync</Text>
            <Text style={styles.heroSub}>Social Hour & Live Device Drive</Text>
          </View>

          {/* Glowing Countdown */}
          <View style={styles.glassCard}>
            <Text style={styles.cardSubTitle}>LIVE COUNTDOWN</Text>
            <View style={styles.countdownContainer}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeNum}>{String(countdown.days).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>days</Text>
              </View>
              <Text style={styles.timeDivider}>:</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeNum}>{String(countdown.hours).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>hours</Text>
              </View>
              <Text style={styles.timeDivider}>:</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeNum}>{String(countdown.mins).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>mins</Text>
              </View>
              <Text style={styles.timeDivider}>:</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeNum}>{String(countdown.secs).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>secs</Text>
              </View>
            </View>
          </View>

          {/* Quick CTA Actions */}
          <View style={styles.actionGrid}>
            <Pressable
              onPress={() => router.push('/wallet')}
              style={({ pressed }) => [styles.actionButton, styles.primaryBtn, pressed && styles.btnPressed]}
            >
              <Ticket size={20} color="#fff" />
              <Text style={styles.actionBtnText}>My Event Pass</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/pledge')}
              style={({ pressed }) => [styles.actionButton, styles.secondaryBtn, pressed && styles.btnPressed]}
            >
              <Laptop size={20} color="#f58420" />
              <Text style={styles.actionBtnTextSecondary}>Pledge Laptop</Text>
            </Pressable>
          </View>

          {/* Live Progress Metrics */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Laptop size={18} color="#f58420" />
              <Text style={styles.cardHeaderTitle}>Live Drive Statistics</Text>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>{stats.pledges}</Text>
                <Text style={styles.metricLabel}>Pledged</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>{stats.wiped}</Text>
                <Text style={styles.metricLabel}>Wiped</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>150</Text>
                <Text style={styles.metricLabel}>Goal</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${stats.progress}%` }]} />
              </View>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Campaign Progress</Text>
                <Text style={styles.progressPct}>{stats.progress.toFixed(0)}%</Text>
              </View>
            </View>
          </View>

          {/* Logistics & Location Details */}
          <View style={styles.glassCard}>
            <Text style={styles.cardSubTitle}>LOGISTICS</Text>

            <View style={styles.logisticsRow}>
              <Calendar size={18} color="#b0aeb7" />
              <View style={styles.logisticsInfo}>
                <Text style={styles.logisticsTitle}>June 12, 2026</Text>
                <Text style={styles.logisticsDetail}>6:00 PM – 9:00 PM EST</Text>
              </View>
            </View>

            <Pressable onPress={openDirections} style={styles.logisticsRow}>
              <MapPin size={18} color="#b0aeb7" />
              <View style={styles.logisticsInfo}>
                <Text style={styles.logisticsTitle}>Portal HQ</Text>
                <Text style={[styles.logisticsDetail, styles.linkText]}>
                  Raleigh, North Carolina ➔
                </Text>
              </View>
            </Pressable>

            <View style={styles.logisticsRow}>
              <Shield size={18} color="#b0aeb7" />
              <View style={styles.logisticsInfo}>
                <Text style={styles.logisticsTitle}>Secure Data Erasure</Text>
                <Text style={styles.logisticsDetail}>
                  Secure wipe verification coordinated by HTI.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06050f',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 132, 32, 0.15)',
    borderColor: 'rgba(245, 132, 32, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: Spacing.two,
  },
  liveBadgeText: {
    color: '#f58420',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#faf9f5',
    textAlign: 'center',
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 14,
    color: '#b0aeb7',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  glassCard: {
    backgroundColor: 'rgba(19, 16, 36, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  cardSubTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f58420',
    letterSpacing: 1,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timeBlock: {
    alignItems: 'center',
    width: 60,
  },
  timeNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#faf9f5',
    fontFamily: 'monospace',
  },
  timeLabel: {
    fontSize: 9,
    color: '#b0aeb7',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 2,
  },
  timeDivider: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.three,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryBtn: {
    backgroundColor: '#f58420',
    shadowColor: '#f58420',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtnTextSecondary: {
    color: '#faf9f5',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.three,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#faf9f5',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#faf9f5',
  },
  metricLabel: {
    fontSize: 11,
    color: '#b0aeb7',
    marginTop: 2,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f58420',
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: '#b0aeb7',
    fontWeight: '500',
    flex: 1,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f58420',
  },
  logisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    borderBottomWidth: 1,
  },
  logisticsInfo: {
    flex: 1,
  },
  logisticsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#faf9f5',
  },
  logisticsDetail: {
    fontSize: 11,
    color: '#b0aeb7',
    marginTop: 1,
  },
  linkText: {
    color: '#f58420',
    fontWeight: '600',
  },
});
