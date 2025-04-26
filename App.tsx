import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from './lib/supabase';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Customer Screens
import LoginScreen from './screens/customer/LoginScreen';
import ProfileScreen from './screens/customer/ProfileScreen';
import MenuScreen from './screens/customer/MenuScreen';
import CartScreen from './screens/customer/CartScreen';
import OrderStatusScreen from './screens/customer/OrderStatusScreen';

// Admin Screens
import AdminDashboard from './screens/admin/DashboardScreen';
import ProductManagement from './screens/admin/ProductManagement';
import InventoryManagement from './screens/admin/InventoryManagement';
import OrderManagement from './screens/admin/OrderManagement';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrderStatusScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Products" component={ProductManagement} />
      <Tab.Screen name="Inventory" component={InventoryManagement} />
      <Tab.Screen name="Orders" component={OrderManagement} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen 
            name="CustomerTabs" 
            component={CustomerTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminTabs" 
            component={AdminTabs}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}