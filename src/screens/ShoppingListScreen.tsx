import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import ShoppingListContent from '../components/ShoppingListContent';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingList'>;

export default function ShoppingListScreen({ navigation }: Props) {
  return <ShoppingListContent navigation={navigation} showHeader />;
}
