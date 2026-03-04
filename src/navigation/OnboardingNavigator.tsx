import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../types/navigation.types';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import BiblePlanSetupScreen from '../screens/onboarding/BiblePlanSetupScreen';

const Stack = createStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        }),
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="BiblePlanSetup" component={BiblePlanSetupScreen} />
    </Stack.Navigator>
  );
}
