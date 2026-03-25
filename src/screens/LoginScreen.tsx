/**
 * LoginScreen - Redesigned 2026
 * Glassmorphism + Seasonal Colors
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Leaf, Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026, getSeasonalColor } from '../theme/designSystemV2';
import { getAktuelleSaison, getJahreszeit } from '../utils/zeitraumUtils';
import GlassInput from '../components/ui/GlassInput';
import AnimatedButton from '../components/ui/AnimatedButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginScreenProps extends Props {
  onSwitchToRegister?: () => void;
}

export default function LoginScreen({ onSwitchToRegister, navigation }: LoginScreenProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Fehler', 'Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Anmeldung fehlgeschlagen', error.message);
    }
  };

  const saison = getAktuelleSaison();
  const jahreszeit = getJahreszeit(saison);
  const seasonalColor = jahreszeit ? getSeasonalColor(jahreszeit) : getSeasonalColor('spring');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Background Gradient */}
        <View style={[styles.backgroundGradient, { backgroundColor: seasonalColor.bg }]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <BlurView intensity={40} style={styles.logoBlur}>
              <Leaf size={48} color={Colors2026.primary} />
            </BlurView>
          </View>
          <Text style={styles.title}>Gartenplaner</Text>
          <Text style={styles.subtitle}>Willkommen zurück</Text>
        </View>

        {/* Glass Card */}
        <BlurView intensity={60} style={styles.glassCard}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Anmelden</Text>

            <GlassInput
              value={email}
              onChangeText={setEmail}
              placeholder="E-Mail"
              icon={<Mail size={20} color={Colors2026.textMuted} />}
              keyboardType="email-address"
              disabled={loading}
            />

            <GlassInput
              value={password}
              onChangeText={setPassword}
              placeholder="Passwort (min. 8 Zeichen)"
              icon={<Lock size={20} color={Colors2026.textMuted} />}
              secureTextEntry={!showPassword}
              disabled={loading}
            />

            <Pressable
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={16} color={Colors2026.textMuted} />
              ) : (
                <Eye size={16} color={Colors2026.textMuted} />
              )}
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              </Text>
            </Pressable>

            <AnimatedButton
              title={loading ? 'Anmelden...' : 'Anmelden'}
              onPress={handleLogin}
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            />

            <Pressable
              style={styles.forgotPassword}
              onPress={() => navigation?.navigate('ForgotPassword')}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>
                Passwort vergessen?
              </Text>
            </Pressable>
          </View>
        </BlurView>

        {/* Register Link */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Noch kein Konto?</Text>
          <Pressable onPress={onSwitchToRegister} disabled={loading}>
            <Text style={styles.registerLink}>Jetzt registrieren</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing2026.xl,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing2026.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing2026.lg,
    ...Shadows2026.md,
  },
  logoBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography2026.display.fontSize,
    fontWeight: '800',
    color: Colors2026.text,
    letterSpacing: -1.5,
    marginBottom: Spacing2026.xs,
  },
  subtitle: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
  },
  glassCard: {
    borderRadius: Radius2026.xl,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    ...Shadows2026.lg,
  },
  form: {
    padding: Spacing2026.xxl,
  },
  formTitle: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    letterSpacing: -0.8,
    marginBottom: Spacing2026.xl,
    textAlign: 'center',
  },
  showPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.xs,
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xs,
  },
  showPasswordText: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: Spacing2026.xl,
    paddingVertical: Spacing2026.md,
  },
  forgotPasswordText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing2026.sm,
    marginTop: Spacing2026.xxl,
  },
  registerText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
  },
  registerLink: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
});
