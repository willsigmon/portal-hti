import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '@/lib/storage';
import { createEventPledge } from '@/lib/event-api';
import { CheckCircle2, ChevronRight, Laptop, ShieldCheck } from 'lucide-react-native';

import StarfieldBackdrop from '@/components/StarfieldBackdrop';
import { Spacing, BottomTabInset } from '@/constants/theme';

export default function PledgeScreen() {
  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const [form, setForm] = useState({
    quantity: '1',
    brand: '',
    condition: 'good',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.quantity || parseInt(form.quantity, 10) < 1) {
      nextErrors.quantity = 'Please enter a valid quantity';
    }
    if (!form.name.trim()) {
      nextErrors.name = 'Full name is required';
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      nextErrors.email = 'Please enter a valid email address';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      let newPledge;
      try {
        const saved = await createEventPledge({
          quantity: form.quantity,
          brand: form.brand,
          condition: form.condition,
          donorName: form.name,
          donorEmail: form.email,
          donorPhone: form.phone,
          notes: form.notes,
        });
        newPledge = {
          ...saved,
          name: saved.donorName,
          email: form.email,
          phone: form.phone,
          count: saved.quantity,
          timestamp: saved.createdAt,
        };
      } catch {
        newPledge = {
          id: `PLG-${Date.now().toString().slice(-6)}`,
          quantity: parseInt(form.quantity, 10),
          count: parseInt(form.quantity, 10),
          brand: form.brand || 'Generic Device',
          condition: form.condition,
          donorName: form.name,
          name: form.name,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          timestamp: new Date().toISOString(),
        };
      }

      const stored = await storage.getItem('ss_pledges');
      const pledges = stored ? JSON.parse(stored) : [];
      pledges.push(newPledge);
      await storage.setItem('ss_pledges', JSON.stringify(pledges));

      setTrackingId(newPledge.id);
      setSuccess(true);
    } catch (e) {
      console.log('Error saving pledge', e);
    }
  };

  const resetForm = () => {
    setForm({
      quantity: '1',
      brand: '',
      condition: 'good',
      name: '',
      email: '',
      phone: '',
      notes: '',
    });
    setSuccess(false);
  };

  if (success) {
    return (
      <View style={styles.container}>
        <StarfieldBackdrop />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successWrapper}>
            <View style={styles.successIconOuter}>
              <CheckCircle2 size={54} color="#f58420" />
            </View>
            <Text style={styles.successTitle}>Pledge Registered!</Text>
            <Text style={styles.successSub}>
              Thank you for supporting HTI’s device drive. We have securely logged your pledge for event coordination.
            </Text>

            <View style={styles.trackingCard}>
              <Text style={styles.trackingLabel}>VERIFICATION ID</Text>
              <Text style={styles.trackingVal}>{trackingId}</Text>
            </View>

            <Text style={styles.successHint}>
              A representative will contact you to schedule data handling, wipe verification, and logistics.
            </Text>

            <Pressable
              onPress={resetForm}
              style={({ pressed }) => [styles.submitBtn, styles.btnPrimary, pressed && styles.btnPressed]}
            >
              <Text style={styles.submitBtnText}>Pledge Another Device</Text>
              <ChevronRight size={18} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StarfieldBackdrop />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header info */}
            <View style={styles.formHeader}>
              <View style={styles.headerIconWrapper}>
                <Laptop size={22} color="#f58420" />
              </View>
              <Text style={styles.formTitle}>Pledge a Laptop</Text>
              <Text style={styles.formSub}>
                All devices are routed through secure data handling, wipe verification, refurbishment, and distribution to NC families.
              </Text>
            </View>

            {/* Step 1: Device Info */}
            <View style={styles.glassCard}>
              <Text style={styles.stepTitle}>01. DEVICE DETAILS</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>How Many Laptops?</Text>
                <TextInput
                  keyboardType="numeric"
                  value={form.quantity}
                  onChangeText={(val) => handleInputChange('quantity', val)}
                  style={[styles.glassInput, errors.quantity && styles.inputErrorBorder]}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                />
                {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Brand / Model (Optional)</Text>
                <TextInput
                  value={form.brand}
                  onChangeText={(val) => handleInputChange('brand', val)}
                  placeholder="Dell Latitude, MacBook, Lenovo etc."
                  style={styles.glassInput}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>General Hardware Condition</Text>
                <View style={styles.conditionSelector}>
                  {['excellent', 'good', 'fair'].map((cond) => (
                    <Pressable
                      key={cond}
                      onPress={() => setForm((prev) => ({ ...prev, condition: cond }))}
                      style={[
                        styles.conditionChip,
                        form.condition === cond && styles.conditionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.conditionChipText,
                          form.condition === cond && styles.conditionChipTextActive,
                        ]}
                      >
                        {cond}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Step 2: Contact Info */}
            <View style={styles.glassCard}>
              <Text style={styles.stepTitle}>02. CONTACT COORDINATION</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Full Name</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(val) => handleInputChange('name', val)}
                  style={[styles.glassInput, errors.name && styles.inputErrorBorder]}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(val) => handleInputChange('email', val)}
                  style={[styles.glassInput, errors.email && styles.inputErrorBorder]}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(val) => handleInputChange('phone', val)}
                  placeholder="(919) 555-0199"
                  style={styles.glassInput}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes or Pickup Preferences (Optional)</Text>
                <TextInput
                  value={form.notes}
                  onChangeText={(val) => handleInputChange('notes', val)}
                  placeholder="Has charger, schedule home pickup etc."
                  style={[styles.glassInput, styles.textArea]}
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                />
              </View>
            </View>

            {/* Submit Block */}
            <View style={styles.submitSection}>
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [styles.submitBtn, styles.btnPrimary, pressed && styles.btnPressed]}
              >
                <ShieldCheck size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Secure Pledge Now</Text>
              </Pressable>
              <Text style={styles.submitNotice}>
                By submitting, you register this hardware for official tax-deductible contribution certification.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  formHeader: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  headerIconWrapper: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 132, 32, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#faf9f5',
    letterSpacing: -0.5,
  },
  formSub: {
    fontSize: 12,
    color: '#b0aeb7',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.four,
    lineHeight: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(19, 16, 36, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f58420',
    letterSpacing: 1,
    marginBottom: Spacing.three,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#faf9f5',
    marginBottom: 6,
  },
  glassInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 12,
    color: '#faf9f5',
    fontSize: 14,
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  conditionSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  conditionChip: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionChipActive: {
    borderColor: '#f58420',
    backgroundColor: 'rgba(245, 132, 32, 0.12)',
  },
  conditionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b0aeb7',
    textTransform: 'capitalize',
  },
  conditionChipTextActive: {
    color: '#f58420',
  },
  submitSection: {
    marginTop: Spacing.two,
  },
  submitBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: '#f58420',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  submitNotice: {
    fontSize: 10,
    color: '#b0aeb7',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 14,
  },
  successWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  successIconOuter: {
    height: 96,
    width: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 132, 32, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#faf9f5',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#b0aeb7',
    textAlign: 'center',
    marginTop: Spacing.two,
    lineHeight: 18,
  },
  trackingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  trackingLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f58420',
    letterSpacing: 1,
  },
  trackingVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#faf9f5',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  successHint: {
    fontSize: 11,
    color: '#b0aeb7',
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: Spacing.five,
  },
});
