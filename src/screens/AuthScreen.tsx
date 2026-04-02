import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import { AuthStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type Props = Partial<NativeStackScreenProps<AuthStackParamList, 'Login'>>;

export default function AuthScreen({ navigation }: Props = {}) {
  const handleSwitchToRegister = () => {
    navigation?.navigate('Register');
  };

  const handleSwitchToLogin = () => {
    navigation?.navigate('Login');
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
      >
        {(props) => (
          <LoginScreen
            {...props}
            onSwitchToRegister={handleSwitchToRegister}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Register"
      >
        {(props) => (
          <RegisterScreen
            {...props}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}
