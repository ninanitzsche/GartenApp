import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { PLANT_ROLES } from '../../data/plant-roles';

interface PlantToggleRowProps {
  plantName: string;
  role: string;
  isZugeordnet: boolean;
  onToggle: () => void;
  onRoleChange: (role: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showReorder?: boolean;
  recommendation?: string;
}

export default function PlantToggleRow({
  plantName,
  role,
  isZugeordnet,
  onToggle,
  onRoleChange,
  onMoveUp,
  onMoveDown,
  showReorder = false,
  recommendation,
}: PlantToggleRowProps) {
  const [showRolePicker, setShowRolePicker] = useState(false);

  return (
    <View style={[styles.container, isZugeordnet && styles.containerActive]}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={onToggle}
      >
        <MaterialIcons
          name={isZugeordnet ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={isZugeordnet ? Colors2026.primary : Colors2026.textMuted}
        />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.plantNameRow}>
          <Text style={[styles.plantName, isZugeordnet && styles.plantNameActive]}>
            {plantName}
          </Text>
          {recommendation && (
            <View style={styles.recommendationBadge}>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          )}
        </View>
        {isZugeordnet && (
          <>
            <TouchableOpacity 
              style={styles.roleButton}
              onPress={() => setShowRolePicker(!showRolePicker)}
            >
              <Text style={[styles.roleText, !role && styles.rolePlaceholder]}>
                {role || 'Rolle wählen...'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={Colors2026.textMuted} />
            </TouchableOpacity>

            {showRolePicker && (
              <View style={styles.rolePicker}>
                {PLANT_ROLES.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={styles.roleOption}
                    onPress={() => {
                      onRoleChange(r);
                      setShowRolePicker(false);
                    }}
                  >
                    <Text style={styles.roleOptionText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {showReorder && isZugeordnet && (
        <View style={styles.reorderButtons}>
          <TouchableOpacity onPress={onMoveUp} style={styles.reorderButton}>
            <MaterialIcons name="arrow-upward" size={18} color={Colors2026.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onMoveDown} style={styles.reorderButton}>
            <MaterialIcons name="arrow-downward" size={18} color={Colors2026.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.sm,
    marginBottom: Spacing2026.sm,
    borderRadius: Radius2026.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerActive: {
    backgroundColor: Colors2026.primary + '10',
    borderColor: Colors2026.primary + '30',
  },
  toggleButton: {
    marginRight: Spacing2026.sm,
  },
  content: {
    flex: 1,
  },
  plantName: {
    ...Typography2026.body,
    color: Colors2026.textMuted,
  },
  plantNameActive: {
    color: Colors2026.text,
    fontWeight: '500',
  },
  plantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing2026.xs,
  },
  recommendationBadge: {
    backgroundColor: Colors2026.status.success + '20',
    paddingHorizontal: Spacing2026.xs,
    paddingVertical: 2,
    borderRadius: Radius2026.sm,
  },
  recommendationText: {
    ...Typography2026.small,
    color: Colors2026.status.success,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: Spacing2026.xs,
    marginTop: Spacing2026.xs,
  },
  roleText: {
    ...Typography2026.small,
    color: Colors2026.text,
    flex: 1,
  },
  rolePlaceholder: {
    color: Colors2026.textMuted,
  },
  rolePicker: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    marginTop: Spacing2026.xs,
    padding: Spacing2026.xs,
    borderWidth: 1,
    borderColor: Colors2026.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleOption: {
    padding: Spacing2026.sm,
  },
  roleOptionText: {
    ...Typography2026.body,
    color: Colors2026.text,
  },
  reorderButtons: {
    flexDirection: 'column',
    gap: 2,
  },
  reorderButton: {
    padding: Spacing2026.xs,
  },
});