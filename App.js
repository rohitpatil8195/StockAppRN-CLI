import * as React from "react";
import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
 import HomeScreen from "./screens/HomeScreen";
 import Stocks from "./components/Stocks";
 import StocksList from "./screens/StockList";
 import LoginScreen from "./screens/LoginScreen";
import LoadingScreen from "./screens/LoadingScreen";
 import Signup from "./screens/Signup";
import ForgotPassword from "./screens/ForgotPassword";
 import * as firebase from "firebase";
import { firebaseConfig } from "./config";
!firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

const Stack = createStackNavigator();

function App({ navigation }) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{
            headerShown: false,
          }}
        />
            <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Stock Watch",
            headerLeft: null,
            headerTintColor: "#ffffff",
            headerStyle: {
              backgroundColor: "#3598DB",
            },
            headerTitleStyle: {
              color: "white",
            },
          }}

          // options={{ headerTitle: "Title", headerLeft: () => null }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
          <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{
            headerShown: false,
          }}
        />

         <Stack.Screen
          name="Signup"
          component={Signup}
          options={{
            headerShown: false,
          }}
        />
     <Stack.Screen
          name="Stock"
          component={Stocks}
          options={{
            headerTintColor: "#ffffff",
            headerTitle: "Search Scrip",
            headerStyle: {
              backgroundColor: "#3598DB",
            },
            headerTitleStyle: {
              color: "white",
            },
          }}
        />
        <Stack.Screen name="StocksList" component={StocksList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

// import React from 'react';
// import {Text,View} from 'react-native';

// const App =()=>{
//     return(
//         <View>
//             <Text>hello Loading</Text>
//         </View>
//     );
// }
// export default App;