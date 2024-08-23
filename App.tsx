import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ProfileScreen from './screens/ProfileScreen';
import PointsTableScreen from './screens/PointsTableScreen';
import LoginScreen from './screens/LoginScreen';
import { PointsProvider } from './screens/PointsProvider'; // Certifique-se de importar corretamente
import RegisterScreen from './screens/RegisterScreen';
import PointConfirmationScreen from './screens/PointConfirmationScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <PointsProvider>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="PointsTableScreen" component={PointsTableScreen} />
          <Stack.Screen name="PointConfirmationScreen" component={PointConfirmationScreen} />
        </Stack.Navigator>
      </PointsProvider>
    </NavigationContainer>
  );
}
