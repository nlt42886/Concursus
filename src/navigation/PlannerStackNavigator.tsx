import { createStackNavigator } from '@react-navigation/stack';
import { PlannerStackParamList } from '../types/navigation.types';
import SchedulerScreen from '../screens/planner/SchedulerScreen';
import TaskDetailScreen from '../screens/planner/TaskDetailScreen';
import AddTaskModal from '../screens/planner/AddTaskModal';

const Stack = createStackNavigator<PlannerStackParamList>();

export default function PlannerStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
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
      <Stack.Screen name="SchedulerHome" component={SchedulerScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen
        name="AddTask"
        component={AddTaskModal}
        options={{
          presentation: 'modal',
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.height, 0],
                  }),
                },
              ],
            },
          }),
        }}
      />
    </Stack.Navigator>
  );
}
