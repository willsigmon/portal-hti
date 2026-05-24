import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { storage } from '@/lib/storage';
import { Ticket, Scan, Key, Calendar, MapPin, Sparkles, AlertTriangle, ShieldCheck, X } from 'lucide-react-native';

import StarfieldBackdrop from '@/components/StarfieldBackdrop';
import { Spacing, BottomTabInset } from '@/constants/theme';

interface TicketData {
  orderId: string;
  qty: number;
  donation: number;
  name: string;
  email: string;
  timestamp: string;
  gateCode: string;
}

export default function WalletScreen() {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Load ticket from secure local storage
  const loadTicket = async () => {
    try {
      const stored = await storage.getItem('ss_ticket');
      if (stored) {
        setTicket(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error loading ticket', e);
    }
  };

  useEffect(() => {
    loadTicket();
  }, []);

  const handleManualImport = async () => {
    const id = orderIdInput.trim().toUpperCase();
    if (!id || !id.startsWith('SS-') || id.length < 7) {
      Alert.alert('Invalid ID', 'Please enter a valid Order ID (e.g., SS-84920)');
      return;
    }

    // Simulate database lookup and import
    const mockTicket: TicketData = {
      orderId: id,
      qty: 2,
      donation: 50,
      name: 'Will Sigmon',
      email: 'wjsigmon@gmail.com',
      timestamp: new Date().toISOString(),
      gateCode: '#0611',
    };

    try {
      await storage.setItem('ss_ticket', JSON.stringify(mockTicket));
      setTicket(mockTicket);
      setOrderIdInput('');
    } catch {
      Alert.alert('Error', 'Failed to securely save ticket');
    }
  };

  const handleScanPress = async () => {
    if (!permission) {
      const status = await requestPermission();
      if (!status.granted) {
        Alert.alert('Camera Blocked', 'Please grant camera access to scan your ticket QR code.');
        return;
      }
    } else if (!permission.granted) {
      const status = await requestPermission();
      if (!status.granted) {
        Alert.alert('Camera Blocked', 'Please grant camera access to scan your ticket QR code.');
        return;
      }
    }
    setShowScanner(true);
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setShowScanner(false);
    if (!data) return;

    // Standard QR code contains orderId or raw ticket JSON
    let orderId = '';
    if (data.startsWith('SS-')) {
      orderId = data;
    } else if (data.includes('verify=')) {
      const parts = data.split('verify=');
      if (parts[1]) orderId = parts[1].split('&')[0];
    }

    if (!orderId) {
      Alert.alert('Invalid QR Code', 'This QR code is not recognized as a Portal Sip & Sync pass.');
      return;
    }

    const mockTicket: TicketData = {
      orderId: orderId,
      qty: 1,
      donation: 25,
      name: 'Will Sigmon',
      email: 'wjsigmon@gmail.com',
      timestamp: new Date().toISOString(),
      gateCode: '#0611',
    };

    try {
      await storage.setItem('ss_ticket', JSON.stringify(mockTicket));
      setTicket(mockTicket);
      Alert.alert('Imported Successfully', `Event Pass ${orderId} has been added to your secure wallet.`);
    } catch {
      Alert.alert('Error', 'Failed to securely save ticket');
    }
  };

  const clearTicket = async () => {
    Alert.alert(
      'Remove Pass?',
      'This will delete the ticket pass from your secure local storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await storage.deleteItem('ss_ticket');
            setTicket(null);
          },
        },
      ]
    );
  };

  if (showScanner) {
    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFill}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <SafeAreaView style={styles.scannerOverlay}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Ticket QR Code</Text>
            <Pressable onPress={() => setShowScanner(false)} style={styles.closeScannerBtn}>
              <X size={20} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.scannerFocusFrame} />
          <Text style={styles.scannerInstructions}>
            Position the QR code inside the frame to import.
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StarfieldBackdrop />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {ticket ? (
            /* Digital Pass Ticket View */
            <View style={styles.ticketWrapper}>
              <View style={styles.ticketCard}>
                {/* Header notches */}
                <View style={styles.notchLeft} />
                <View style={styles.notchRight} />

                {/* Ticket Top Part */}
                <View style={styles.ticketTop}>
                  <View style={styles.brandRow}>
                    <View style={styles.miniBadge}>
                      <Sparkles size={10} color="#f58420" />
                      <Text style={styles.miniBadgeText}>OFFICIAL PASS</Text>
                    </View>
                    <Text style={styles.orderIdText}>{ticket.orderId}</Text>
                  </View>
                  <Text style={styles.ticketTitle}>Sip & Sync</Text>
                  <Text style={styles.ticketSub}>Social Hour & Live Drive</Text>

                  {/* Divider Dash line */}
                  <View style={styles.dashDivider} />
                </View>

                {/* Ticket Middle QR Part */}
                <View style={styles.ticketMiddle}>
                  <View style={styles.qrContainer}>
                    <Image
                      source={{
                        uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://portal-hti.vercel.app/?verify=${ticket.orderId}&color=06050f&margin=10`,
                      }}
                      style={styles.qrImage}
                    />
                    <View style={styles.scannerNoticeBox}>
                      <ShieldCheck size={14} color="#f58420" />
                      <Text style={styles.scannerNoticeText}>Active Secure Pass</Text>
                    </View>
                  </View>
                </View>

                {/* Ticket Details Bottom Part */}
                <View style={styles.ticketBottom}>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>PRIMARY GUEST</Text>
                      <Text style={styles.detailVal} numberOfLines={1}>{ticket.name}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>PASSES HELD</Text>
                      <Text style={styles.detailVal}>{ticket.qty} Passes</Text>
                    </View>
                  </View>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>DONATION LEVEL</Text>
                      <Text style={styles.detailVal}>${ticket.donation.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>GATE ENTRY CODE</Text>
                      <View style={styles.codeRow}>
                        <Key size={12} color="#f58420" />
                        <Text style={styles.gateCodeVal}>{ticket.gateCode}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.venueRow}>
                    <Calendar size={12} color="#b0aeb7" />
                    <Text style={styles.venueText}>June 11, 2026 • 6–9 PM</Text>
                  </View>
                  <View style={styles.venueRow}>
                    <MapPin size={12} color="#b0aeb7" />
                    <Text style={styles.venueText}>Portal HQ, Raleigh, NC</Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={clearTicket}
                style={({ pressed }) => [styles.clearBtn, pressed && styles.btnPressed]}
              >
                <Text style={styles.clearBtnText}>Remove Pass From Wallet</Text>
              </Pressable>
            </View>
          ) : (
            /* Empty Wallet State - Ticket Import Views */
            <View style={styles.emptyWrapper}>
              <View style={styles.emptyIconBox}>
                <Ticket size={48} color="#b0aeb7" />
              </View>
              <Text style={styles.emptyTitle}>Your Secure Wallet is Empty</Text>
              <Text style={styles.emptySub}>
                Import your Sip & Sync Social Hour ticket to store it offline on your device for fast gate check-in.
              </Text>

              {/* Action Buttons */}
              <View style={styles.importActions}>
                <Pressable
                  onPress={handleScanPress}
                  style={({ pressed }) => [
                    styles.primaryImportBtn,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Scan size={18} color="#fff" />
                  <Text style={styles.primaryImportBtnText}>Scan Pass QR Code</Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR MANUAL IMPORT</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.manualImportBox}>
                  <TextInput
                    value={orderIdInput}
                    onChangeText={setOrderIdInput}
                    placeholder="Enter Order ID (e.g. SS-84920)"
                    style={styles.manualInput}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    autoCapitalize="characters"
                  />
                  <Pressable
                    onPress={handleManualImport}
                    style={({ pressed }) => [
                      styles.manualSubmitBtn,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Text style={styles.manualSubmitText}>Import</Text>
                  </Pressable>
                </View>

                <View style={styles.warningInfoBox}>
                  <AlertTriangle size={14} color="#f58420" style={{ marginTop: 2 }} />
                  <Text style={styles.warningInfoText}>
                    If you haven’t booked a pass yet, please visit the portal at portal-hti.vercel.app to pledge or register.
                  </Text>
                </View>
              </View>
            </View>
          )}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  emptyWrapper: {
    alignItems: 'center',
    paddingTop: Spacing.six,
  },
  emptyIconBox: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#faf9f5',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#b0aeb7',
    textAlign: 'center',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    lineHeight: 18,
  },
  importActions: {
    width: '100%',
    marginTop: Spacing.five,
  },
  primaryImportBtn: {
    backgroundColor: '#f58420',
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryImportBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.four,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#b0aeb7',
    letterSpacing: 1,
  },
  manualImportBox: {
    flexDirection: 'row',
    gap: 10,
  },
  manualInput: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 14,
    color: '#faf9f5',
    fontSize: 14,
  },
  manualSubmitBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 10,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSubmitText: {
    color: '#faf9f5',
    fontSize: 14,
    fontWeight: '700',
  },
  warningInfoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 132, 32, 0.08)',
    borderColor: 'rgba(245, 132, 32, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: Spacing.five,
  },
  warningInfoText: {
    flex: 1,
    color: '#b0aeb7',
    fontSize: 11,
    lineHeight: 15,
  },
  /* Ticket View Styles */
  ticketWrapper: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#faf9f5', // High-contrast clean card for camera scanning
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  notchLeft: {
    position: 'absolute',
    left: -14,
    top: 156,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#06050f',
    zIndex: 10,
  },
  notchRight: {
    position: 'absolute',
    right: -14,
    top: 156,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#06050f',
    zIndex: 10,
  },
  ticketTop: {
    padding: 24,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 132, 32, 0.1)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 4,
  },
  miniBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#f58420',
  },
  orderIdText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    color: '#06050f',
  },
  ticketTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#06050f',
    marginTop: Spacing.two,
    letterSpacing: -0.5,
  },
  ticketSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#60646c',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dashDivider: {
    height: 1,
    borderColor: 'rgba(6, 5, 15, 0.12)',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 20,
    width: '100%',
  },
  ticketMiddle: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 172,
    height: 172,
    backgroundColor: '#fff',
  },
  scannerNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.two,
  },
  scannerNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f58420',
    textTransform: 'uppercase',
  },
  ticketBottom: {
    backgroundColor: '#131024', // Premium dark contrast wrapper at bottom of white ticket card!
    padding: 24,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
    gap: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#f58420',
    letterSpacing: 1,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#faf9f5',
    marginTop: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  gateCodeVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#faf9f5',
    fontFamily: 'monospace',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  venueText: {
    fontSize: 11,
    color: '#b0aeb7',
    fontWeight: '500',
  },
  clearBtn: {
    marginTop: Spacing.four,
    paddingVertical: 12,
  },
  clearBtnText: {
    color: '#b0aeb7',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  /* Scanner Layout Styles */
  scannerOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeScannerBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFocusFrame: {
    width: 240,
    height: 240,
    borderColor: '#f58420',
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scannerInstructions: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
    fontWeight: '500',
  },
});
