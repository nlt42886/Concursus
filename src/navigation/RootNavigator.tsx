import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSettingsStore } from '../store/settingsStore';
import MainTabNavigator from './MainTabNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { RootStackParamList } from '../types/navigation.types';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : null}
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
