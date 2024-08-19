import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ProfileScreen from './screens/ProfileScreen';
import PointsTableScreen from './screens/PointsTableScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="PointsTable" component={PointsTableScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
