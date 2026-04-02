import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, Sun, Droplets, Ruler, Sprout, Users, Bug, Leaf, AlertTriangle } from 'lucide-react-native';
import { AIPlantCareData } from '../../types/ai';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../ui/SectionHeader';

interface Props {
  care: AIPlantCareData;
  delay?: number;
}

export default function PlantCareCard({ care, delay = 60 }: Props) {
  if (!care) return null;

  const hasPlanting = (care.plantingNotes?.length ?? 0) > 0 || (care.careTips?.length ?? 0) > 0;
  const hasPermaculture =
    (care.permaculture?.pestControl?.length ?? 0) > 0 ||
    (care.permaculture?.soilImprovement?.length ?? 0) > 0 ||
    (care.permaculture?.interactions?.length ?? 0) > 0 ||
    (care.permaculture?.weedManagement?.length ?? 0) > 0;

  return (
    <>
      {/* 1. Standort & Umwelt */}
      {(care.profile?.light || care.profile?.waterNeeds || care.profile?.wateringMethod || care.profile?.soil || care.profile?.frostTolerance) && (
        <View style={styles.section}>
          <SectionHeader
            title="Standort"
            subtitle="Umweltbedingungen"
            icon={<Sun size={20} color={Colors2026.status.warning} />}
            animated={true}
            delay={delay}
          />
          <GlassCard variant="light">
            <View style={styles.chipRow}>
              {care.profile?.light && (
                <View style={styles.chip}>
                  <Sun size={14} color={Colors2026.status.warning} />
                  <Text style={styles.chipText}>{care.profile.light}</Text>
                </View>
              )}
              {care.profile?.waterNeeds && (
                <View style={styles.chip}>
                  <Droplets size={14} color={Colors2026.status.info} />
                  <Text style={styles.chipText}>{care.profile.waterNeeds}</Text>
                </View>
              )}
              {care.profile?.frostTolerance && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>❄️ {care.profile.frostTolerance}</Text>
                </View>
              )}
            </View>
            {care.profile?.wateringMethod && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>💦 Bewässerung</Text>
                <Text style={styles.detailValue}>{care.profile.wateringMethod}</Text>
              </View>
            )}
            {care.profile?.soil && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🪴 Boden</Text>
                <Text style={styles.detailValue}>{care.profile.soil}</Text>
              </View>
            )}
          </GlassCard>
        </View>
      )}

      {/* 2. Wuchs */}
      {(care.profile?.height || care.profile?.spread) && (
        <View style={styles.section}>
          <SectionHeader
            title="Wuchs"
            icon={<Ruler size={20} color={Colors2026.primary} />}
            animated={true}
            delay={delay + 10}
          />
          <GlassCard variant="light">
            <View style={styles.chipRow}>
              {care.profile?.height && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>📏 {care.profile.height}</Text>
                </View>
              )}
              {care.profile?.spread && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>↔️ {care.profile.spread}</Text>
                </View>
              )}
            </View>
            {/* Badges */}
            {(care.profile?.edibleParts || care.profile?.harvestTime || care.profile?.expectedYield || care.profile?.isToxic || care.profile?.isInvasive) && (
              <View style={[styles.chipRow, { marginTop: 10 }]}>
                {care.profile?.edibleParts && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>🍽️ {care.profile.edibleParts}</Text>
                  </View>
                )}
                {care.profile?.harvestTime && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>🌾 {care.profile.harvestTime}</Text>
                  </View>
                )}
                {care.profile?.expectedYield && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>📦 {care.profile.expectedYield}</Text>
                  </View>
                )}
                {care.profile?.isToxic && (
                  <View style={[styles.badge, styles.badgeWarning]}>
                    <Text style={[styles.badgeText, { color: Colors2026.status.warning }]}>☠️ {care.profile.toxicTo}</Text>
                  </View>
                )}
                {care.profile?.isInvasive && (
                  <View style={[styles.badge, styles.badgeWarning]}>
                    <AlertTriangle size={12} color={Colors2026.status.warning} />
                    <Text style={[styles.badgeText, { color: Colors2026.status.warning }]}>Invasiv</Text>
                  </View>
                )}
              </View>
            )}
            {/* Scores */}
            {(care.profile?.pollinatorScore > 0 || care.profile?.beneficialInsectScore > 0) && (
              <View style={[styles.chipRow, { marginTop: 10 }]}>
                {care.profile?.pollinatorScore > 0 && (
                  <Text style={styles.scoreText}>
                    🐝 {'★'.repeat(Math.min(care.profile.pollinatorScore, 5))}{'☆'.repeat(5 - Math.min(care.profile.pollinatorScore, 5))}
                  </Text>
                )}
                {care.profile?.beneficialInsectScore > 0 && (
                  <Text style={styles.scoreText}>
                    🐞 {'★'.repeat(Math.min(care.profile.beneficialInsectScore, 5))}{'☆'.repeat(5 - Math.min(care.profile.beneficialInsectScore, 5))}
                  </Text>
                )}
              </View>
            )}
          </GlassCard>
        </View>
      )}

      {/* 3. Pflanzen & Pflege */}
      {hasPlanting && (
        <View style={styles.section}>
          <SectionHeader
            title="Pflanzen & Pflege"
            icon={<Sprout size={20} color={Colors2026.status.success} />}
            animated={true}
            delay={delay + 20}
          />
          <GlassCard variant="light">
            {care.plantingNotes?.map((n, i) => (
              <View key={`pn${i}`} style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🌱</Text>
                <Text style={styles.tipText}>{n}</Text>
              </View>
            ))}
            {care.careTips?.map((t, i) => (
              <View key={`ct${i}`} style={styles.tipRow}>
                <Text style={styles.tipEmoji}>💧</Text>
                <Text style={styles.tipText}>{t}</Text>
              </View>
            ))}
          </GlassCard>
        </View>
      )}

      {/* 4. Gute Beetnachbarn */}
      {(care.companionPlants?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Gute Beetnachbarn"
            icon={<Users size={20} color={Colors2026.status.success} />}
            animated={true}
            delay={delay + 30}
          />
          <GlassCard variant="light">
            {care.companionPlants.map((cp, i) => {
              const [name, ...rest] = cp.split(' - ');
              const reason = rest.join(' - ');
              return (
                <View key={`gc${i}`} style={styles.companionRow}>
                  <View style={styles.companionGood}>
                    <Text style={styles.companionIcon}>✓</Text>
                  </View>
                  <View style={styles.companionContent}>
                    <Text style={styles.companionName}>{name.trim()}</Text>
                    {reason && <Text style={styles.companionReason}>{reason.trim()}</Text>}
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </View>
      )}

      {/* 5. Schlechte Beetnachbarn */}
      {(care.badCompanions?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Schlechte Beetnachbarn"
            icon={<Users size={20} color={Colors2026.status.error} />}
            animated={true}
            delay={delay + 35}
          />
          <GlassCard variant="light">
            {care.badCompanions.map((bc, i) => {
              const [name, ...rest] = bc.split(' - ');
              const reason = rest.join(' - ');
              return (
                <View key={`bc${i}`} style={styles.companionRow}>
                  <View style={styles.companionBad}>
                    <Text style={styles.companionIcon}>✗</Text>
                  </View>
                  <View style={styles.companionContent}>
                    <Text style={styles.companionName}>{name.trim()}</Text>
                    {reason && <Text style={styles.companionReason}>{reason.trim()}</Text>}
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </View>
      )}

      {/* 5. Permakultur */}
      {hasPermaculture && (
        <View style={styles.section}>
          <SectionHeader
            title="Permakultur"
            subtitle="Interaktionen"
            icon={<Leaf size={20} color={Colors2026.status.success} />}
            animated={true}
            delay={delay + 40}
          />
          <GlassCard variant="light">
            {care.permaculture.pestControl?.map((pc, i) => (
              <View key={`pc${i}`} style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🐞</Text>
                <Text style={styles.tipText}>{pc}</Text>
              </View>
            ))}
            {care.permaculture.soilImprovement?.map((si, i) => (
              <View key={`si${i}`} style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🪱</Text>
                <Text style={styles.tipText}>{si}</Text>
              </View>
            ))}
            {care.permaculture.interactions?.map((ic, i) => (
              <View key={`ic${i}`} style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🔄</Text>
                <Text style={styles.tipText}>{ic}</Text>
              </View>
            ))}
            {care.permaculture.weedManagement?.map((wm, i) => (
              <View key={`wm${i}`} style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🌾</Text>
                <Text style={styles.tipText}>{wm}</Text>
              </View>
            ))}
          </GlassCard>
        </View>
      )}

      {/* KI Badge */}
      <View style={styles.section}>
        <View style={styles.aiBadge}>
          <Sparkles size={14} color={Colors2026.status.info} />
          <Text style={styles.aiBadgeText}>KI-generiert</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing2026.lg,
    paddingHorizontal: Spacing2026.xl,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.bg,
  },
  chipText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.text,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeWarning: {
    backgroundColor: Colors2026.status.warning + '18',
  },
  badgeText: {
    fontSize: 12,
    color: Colors2026.text,
    fontWeight: '500',
  },
  detailRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors2026.divider,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors2026.textMuted,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: Colors2026.text,
    lineHeight: 20,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
    alignItems: 'flex-start',
  },
  tipEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    color: Colors2026.text,
    flex: 1,
    lineHeight: 20,
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  companionGood: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors2026.status.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  companionBad: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors2026.status.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  companionIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors2026.text,
  },
  companionContent: {
    flex: 1,
  },
  companionName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors2026.text,
  },
  companionReason: {
    fontSize: 12,
    color: Colors2026.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  scoreText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors2026.status.info + '12',
    borderRadius: Radius2026.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  aiBadgeText: {
    fontSize: 12,
    color: Colors2026.status.info,
    fontWeight: '500',
  },
});
