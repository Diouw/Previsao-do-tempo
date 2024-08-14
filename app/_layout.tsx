import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Index from './index';

const Stack = createStackNavigator();


function RootLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" component={Index}/>
    </Stack.Navigator>
  );
}


export default RootLayout;