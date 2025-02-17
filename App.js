import 'react-native-gesture-handler';
import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Colors from './assets/colors/Colors'

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid } from 'react-native';

import Account from './src/AccountScreens/AccountMain';
import Friends from './src/FriendScreens/FriendsMain';
import Groups from './src/GroupScreens/GroupsMain';
import Dashboard from './src/DashboardScreens/DashboardMain';
import Notifications from './src/DashboardScreens/Notifications';
import Insights from './src/DashboardScreens/Insights';
import AddExpense from './src/ExpenseScreens/AddExpense';
import DateSelector from './src/DashboardScreens/DateSelector';
import GroupMessages from './src/GroupScreens/GroupMessages';
import FriendMessages from './src/FriendScreens/FriendMessages';
import NewGroup from './src/GroupScreens/NewGroup';
import SearchFriend from './src/FriendScreens/SearchFriend';
import FriendSetting from './src/FriendScreens/FriendSetting';
import GroupSetting from './src/GroupScreens/GroupSetting';
import AddMemberGroup from './src/GroupScreens/AddMemberGroup';
import AccountSettings from './src/AccountScreens/AccountSettings';
import BugReport from './src/AccountScreens/BugReport';
import BlockList from './src/AccountScreens/BlockList';
import Register from './src/StartScreens/Register';
import LogIn from './src/StartScreens/LogIn';
import Expenses from './src/DashboardScreens/Expenses';
import ExpenseDetails from './src/ExpenseScreens/ExpenseDetails';
import SettleExpense from './src/ExpenseScreens/SettleExpense';
import SelectCountry from './src/StartScreens/SelectCountry';
import DeleteAccount from './src/AccountScreens/DeleteAccount';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// create the bottomtab navigator
const bottomTab = createBottomTabNavigator()

// create the stack navigator
const Stack = createStackNavigator();

const queryClient = new QueryClient();

//Default function to export
export default function App() {

  try {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
  catch (error) {
    console.error(error);
  }

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);
  });

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const getToken = async () => {
    const token = await messaging().getToken()
    console.log('token =', token)
  }

  useEffect(() => {
    requestUserPermission()
    getToken()
  }, [])

  async function saveTokenToDatabase(token) {
    // Assume user is already signed in
    if (auth().currentUser) {
      const userId = auth().currentUser.uid;

      // Add the token to the users datastore
      await firestore()
        .collection('Users')
        .doc(userId)
        .set({
          'token': token,
        }, { merge: true });
    }

  }

  useEffect(() => {
    // Get the device token
    messaging()
      .getToken()
      .then(token => {
        return saveTokenToDatabase(token);
      });

    // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

    // Listen to whether the token changes
    return messaging().onTokenRefresh(token => {
      saveTokenToDatabase(token);
    });
  }, []);



  return (

    // Basic navigator default. Stack navigator.
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}>
          <Stack.Screen name="SelectCountry" component={SelectCountry} />
          <Stack.Screen name="LogIn" component={LogIn} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name='BottomNav' component={BottomTabs} />
          <Stack.Screen name="GroupSetting" component={GroupSetting} />
          <Stack.Screen name="FriendSetting" component={FriendSetting} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Insights" component={Insights} />
          <Stack.Screen name="DateSelector" component={DateSelector} />
          <Stack.Screen name="GroupMessages" component={GroupMessages} />
          <Stack.Screen name="FriendMessages" component={FriendMessages} />
          <Stack.Screen name="AccountSettings" component={AccountSettings} />
          <Stack.Screen name="NewGroup" component={NewGroup} />
          <Stack.Screen name="SearchFriend" component={SearchFriend} />
          <Stack.Screen name="AddMemberGroup" component={AddMemberGroup} />
          <Stack.Screen name="Groups" component={Groups} />
          <Stack.Screen name="Friends" component={Friends} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="BlockList" component={BlockList} />
          <Stack.Screen name="BugReport" component={BugReport} />
          <Stack.Screen name="AddExpense" component={AddExpense} />
          <Stack.Screen name="Expenses" component={Expenses} />
          <Stack.Screen name="ExpenseDetails" component={ExpenseDetails} />
          <Stack.Screen name="SettleExpense" component={SettleExpense} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  )
}

// Bottomtabs function
function BottomTabs() {
  return (
    // Bottomtab bar styles, Bottom tab icon styles and fuctionality
    <bottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: 'silver',
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.black,
        tabBarLabelStyle: { fontSize: 14 },
        tabBarItemStyle: { margin: 7 },
        tabBarStyle: { width: '100%', height: 65, backgroundColor: '#ffffff' }
      }}>
      <bottomTab.Screen
        name='Dashboard'
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? <Icon name='trending-up' size={24} color={Colors.black} /> : <Icon name='trending-up' size={24} color='silver' />
        }} />
      <bottomTab.Screen
        name='Friends'
        component={Friends}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? <Icon name='face' size={24} color={Colors.black} /> : <Icon name='face' size={24} color='silver' />
        }} />
      <bottomTab.Screen
        name='Groups'
        component={Groups}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? <Icon name='group' size={24} color={Colors.black} /> : <Icon name='group' size={24} color='silver' />
        }} />
      <bottomTab.Screen
        name='Account'
        component={Account}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? <Icon name='account-box' size={24} color={Colors.black} /> : <Icon name='account-box' size={24} color='silver' />
        }} />
    </bottomTab.Navigator>
  )
}

