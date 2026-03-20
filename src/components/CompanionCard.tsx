import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PlantCompanion } from '../types/companion';
import Colors from '../theme/colors';

interface CompanionCardProps {
  companion: PlantCompanion;
  type: 'good' | 'bad';
}

export default function CompanionCard({ companion, type }: CompanionCardProps) {
  const companions = type === 'good' ? companion.good_companions : companion.bad_companions;
  const reasons = type === 'good' ? companion.good_reasons : companion.bad_reasons;

  if (!companions || companions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons
          name={type === 'good' ? 'thumb-up' : 'thumb-down'}
          size={18}
          color={type === 'good' ? Colors.success : Colors.error}
        />
        <Text style={[styles.title, type === 'good' ? styles.goodTitle : styles.badTitle]}>
          {type === 'good' ? 'Gute Nachbarn' : 'Schlechte Nachbarn'}
        </Text>
      </View>
      
      <View style={styles.list}>
        {companions.map((comp, index) => (
          <View key={index} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: type === 'good' ? Colors.success : Colors.error }]} />
            <View style={styles.itemContent}>
              <Text style={styles.plantName}>{getDisplayName(comp)}</Text>
              {reasons && reasons[index] && (
                <Text style={styles.reason}>{reasons[index]}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function getDisplayName(name: string): string {
  const nameMap: Record<string, string> = {
    tomato: 'Tomate',
    carrot: 'Karotte',
    onion: 'Zwiebel',
    pea: 'Erbsen',
    bean: 'Bohnen',
    cucumber: 'Gurke',
    lettuce: 'Salat',
    radish: 'Radieschen',
    spinach: 'Spinat',
    potato: 'Kartoffel',
    cabbage: 'Kohl',
    pepper: 'Paprika',
    zucchini: 'Zucchini',
    eggplant: 'Aubergine',
    basil: 'Basilikum',
    dill: 'Dill',
    parsley: 'Petersilie',
    chive: 'Schnittlauch',
    rosemary: 'Rosmarin',
    sage: 'Salbei',
    thyme: 'Thymian',
    mint: 'Minze',
    marigold: 'Ringelblume',
    nasturtium: 'Kapuzinerkresse',
    sunflower: 'Sonnenblume',
    strawberry: 'Erdbeere',
    garlic: 'Knoblauch',
    corn: 'Mais',
    squash: 'Kürbis',
    asparagus: 'Spargel',
    beet: 'Rote Bete',
    cauliflower: 'Blumenkohl',
    horseradish: 'Meerrettich',
    celery: 'Sellerie',
    grapes: 'Weintrauben',
    apple: 'Apfel',
    roses: 'Rosen',
  };
  return nameMap[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  goodTitle: {
    color: Colors.success,
  },
  badTitle: {
    color: Colors.error,
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  plantName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  reason: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
});
