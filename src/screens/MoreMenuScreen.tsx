import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { User, ShoppingCart, Sprout, BookOpen, LogOut, ChevronRight, Settings } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { generateTasksForAllPlants } from '../services/taskGenerationService';
import GlassCard from '../components/ui/GlassCard';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = NativeStackScreenProps<RootStackParamList, 'MoreMenu'>;

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.menuItem, animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 200 }); }}
    >
      <View style={styles.menuItemIcon}>{icon}</View>
      <Text style={styles.menuItemText}>{label}</Text>
      <ChevronRight size={20} color={Colors2026.textMuted} />
    </AnimatedPressable>
  );
}

export default function MoreMenuScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const [generatingTasks, setGeneratingTasks] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchten Sie sich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Fehler', 'Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Glass Header */}
      <BlurView intensity={60} style={styles.glassHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Mehr</Text>
          </View>
          <View style={styles.headerIcon}>
            <Settings size={24} color={Colors2026.primary} />
          </View>
        </View>
      </BlurView>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <User size={32} color={Colors2026.primary} />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

       {/* Konto Section */}
       <View style={styles.section}>
         <Text style={styles.sectionTitle}>Konto</Text>
         <GlassCard variant="light" animated={false}>
           <MenuItem
             icon={<User size={20} color={Colors2026.primary} />}
             label="Mein Profil"
             onPress={() => navigation.navigate({ name: 'Profile' })}
           />
         </GlassCard>
       </View>

       {/* Aufgaben Section */}
       <View style={styles.section}>
         <Text style={styles.sectionTitle}>Aufgaben</Text>
         <GlassCard variant="light" animated={false}>
            <MenuItem
              icon={<Sprout size={20} color={Colors2026.primary} />}
              label="Aufgaben für Pflanzen generieren"
              onPress={() => {
                (async () => {
                  try {
                    setGeneratingTasks(true);
                    const result = await generateTasksForAllPlants({
                      maxTasksPerPlant: 3,
                      forceRegenerate: false,
                    });
                    setGeneratingTasks(false);
                    
                    if (result.success) {
                      Alert.alert(
                        'Erfolg',
                        `${result.generatedCount} Aufgaben generiert${result.skippedCount > 0 ? ` (${result.skippedCount} übersprungen)` : ''}`
                      );
                    } else {
                      Alert.alert('Fehler', result.error || 'Unbekannter Fehler');
                    }
                  } catch (error: any) {
                    setGeneratingTasks(false);
                    Alert.alert('Fehler', error.message || 'Unbekannter Fehler');
                  }
                })();
              }}
            />
         </GlassCard>
       </View>

       {/* Funktionen Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Funktionen</Text>
        <GlassCard variant="light" animated={false}>
           <MenuItem
             icon={<ShoppingCart size={20} color={Colors2026.primary} />}
             label="Einkaufsliste"
             onPress={() => navigation.navigate({ name: 'ShoppingDashboard' })}
           />
          <MenuItem
            icon={<Sprout size={20} color={Colors2026.primary} />}
            label="Ernte-Tagebuch"
            onPress={() => navigation.navigate('HarvestLog')}
          />
          <MenuItem
            icon={<BookOpen size={20} color={Colors2026.primary} />}
            label="Wissensdatenbank"
            onPress={() => navigation.navigate('KnowledgeBase')}
          />
        </GlassCard>
      </View>

      {/* Logout Button */}
      <AnimatedPressable
        style={[styles.logoutButton, animatedStyle]}
        onPress={handleLogout}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 200 }); }}
      >
        <LogOut size={20} color="#fff" />
        <Text style={styles.logoutText}>Abmelden</Text>
      </AnimatedPressable>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  content: {
    paddingBottom: Spacing2026.xxxl * 2,
  },
  glassHeader: {
    paddingTop: 60,
    paddingBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '800',
    color: Colors2026.text,
    letterSpacing: -0.8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: Spacing2026.xxl,
  },
   avatar: {
     width: 72,
     height: 72,
     borderRadius: 36,
     backgroundColor: Colors2026.glass.tint,
     alignItems: 'center',
     justifyContent: 'center',
     ...Shadows2026.soft,
   },
  email: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textSecondary,
    marginTop: Spacing2026.md,
  },
  section: {
    paddingHorizontal: Spacing2026.xl,
    marginBottom: Spacing2026.lg,
  },
  sectionTitle: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.textMuted,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: Spacing2026.sm,
    marginLeft: Spacing2026.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.md,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius2026.sm,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing2026.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: Typography2026.body.fontSize,
    fontWeight: '500',
    color: Colors2026.text,
  },
  logoutButton: {
    backgroundColor: Colors2026.status.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing2026.lg,
    paddingHorizontal: Spacing2026.xl,
    borderRadius: Radius2026.md,
    marginHorizontal: Spacing2026.xl,
    marginTop: Spacing2026.xl,
     ...Shadows2026.soft,
  },
  logoutText: {
    color: '#fff',
    fontSize: Typography2026.body.fontSize,
    fontWeight: '700',
    marginLeft: Spacing2026.sm,
  },
  spacer: {
    height: Spacing2026.xl,
  },
});
