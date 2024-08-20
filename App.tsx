import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ProfileScreen from './screens/ProfileScreen';
import PointsTableScreen from './screens/PointsTableScreen';
import LoginScreen from './screens/LoginScreen';
import { PointsProvider } from './screens/PointsProvider'; // Certifique-se de importar corretamente

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <PointsProvider>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="PointsTableScreen" component={PointsTableScreen} />
        </Stack.Navigator>
      </PointsProvider>
    </NavigationContainer>
  );
}
