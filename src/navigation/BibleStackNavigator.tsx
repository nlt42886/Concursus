import { createStackNavigator } from '@react-navigation/stack';
import { BibleStackParamList } from '../types/navigation.types';
import BibleHomeScreen from '../screens/bible/BibleHomeScreen';
import PassageScreen from '../screens/bible/PassageScreen';
import PlanSelectScreen from '../screens/bible/PlanSelectScreen';

const Stack = createStackNavigator<BibleStackParamList>();

export default function BibleStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, next, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
            opacity: next
              ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] })
              : 1,
          },
        }),
      }}
    >
      <Stack.Screen name="BibleHome" component={BibleHomeScreen} />
      <Stack.Screen name="PlanSelect" component={PlanSelectScreen} />
      <Stack.Screen name="PassageView" component={PassageScreen} />
    </Stack.Navigator>
  );
}
