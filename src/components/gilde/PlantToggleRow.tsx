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
        <Text style={[styles.plantName, isZugeordnet && styles.plantNameActive]}>
          {plantName}
        </Text>
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
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.sm,
    marginBottom: Spacing2026.xs,
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
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 5,
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