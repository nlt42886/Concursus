import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation.types';
import TodayScreen from '../screens/planner/TodayScreen';
import PlannerStackNavigator from './PlannerStackNavigator';
import BibleStackNavigator from './BibleStackNavigator';
import SettingsScreen from '../screens/settings/SettingsScreen';
import CustomBottomTabBar from '../components/navigation/BottomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Planner" component={PlannerStackNavigator} />
      <Tab.Screen name="Bible" component={BibleStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
