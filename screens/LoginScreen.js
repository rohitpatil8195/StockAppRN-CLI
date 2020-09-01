import React, { Component, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  YellowBox,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { GoogleSignin, statusCodes } from 'react-native-google-signin';

//import { FontAwesome5 } from "@expo/vector-icons";
import firebase from "firebase";
import _ from "lodash";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
//import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
//import * as Google from "expo-google-app-auth";
import Toast from "react-native-root-toast";
import Loader from "./loader";

//YellowBox.ignoreWarnings(["Setting a timer"]);
// const _console = _.clone(console);
// console.warn = (message) => {
//   if (message.indexOf("Setting a timer") <= -1) {
//     _console.warn(message);
//   }
// };

class LoginScreen extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    GoogleSignin.configure({
      webClientId: "958420409934-h1ueiag5q9ca7d3q4u830g9kjn3c62to.apps.googleusercontent.com",
      // androidClientId:
      //   "958420409934-c6vqjtpcd4htva3ad9i836q0c4lkml57.apps.googleusercontent.com",
      // iosClientId:
      //   "958420409934-n4kl3b1s5t801uri6qbnu60krnctu50p.apps.googleusercontent.com",
      scopes: ["profile", "email"],
    })
  }

  shortToast = (message) => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
    });
  };

  state = {
    email: "",
    password: "",
    loading: false,
  };

  handleLogin = () => {
    this.setState({
      email: "",
      password: "",
      loading: true,
    });
    const { email, password } = this.state;
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this.props.navigation.replace("Home"))
      .then(() => {
        this.shortToast("Login Success!");
        this.setState({
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
        this.shortToast("Authentication Failed");
      });
  };

  isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
          firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };

  onSignIn = (googleUser) => {
    // console.log("Google Auth Response", googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(
      function (firebaseUser) {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!this.isUserEqual(googleUser, firebaseUser)) {
          // Build Firebase credential with the Google ID token.
          var credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken
          );
          // Sign in with credential from the Google user.
          firebase
            .auth()
            .signInWithCredential(credential)
            .then(function (result) {
              console.log("user signed in ");
              if (result.additionalUserInfo.isNewUser) {
                firebase
                  .database()
                  .ref("/users/" + result.user.uid)
                  .set({
                    gmail: result.user.email,
                    profile_picture: result.additionalUserInfo.profile.picture,
                    first_name: result.additionalUserInfo.profile.given_name,
                    last_name: result.additionalUserInfo.profile.family_name,
                    watchlist: [],
                    created_at: Date.now(),
                  })
                  .then(function (snapshot) {
                    // console.log('Snapshot', snapshot);
                  });
              } else {
                firebase
                  .database()
                  .ref("/users/" + result.user.uid)
                  .update({
                    last_logged_in: Date.now(),
                    gmail: result.user.email,
                    profile_picture: result.additionalUserInfo.profile.picture,
                    first_name: result.additionalUserInfo.profile.given_name,
                    last_name: result.additionalUserInfo.profile.family_name,
                  });
              }
            })
            .catch(function (error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // The email of the user's account used.
              var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
              var credential = error.credential;
              // ...
            });
        } else {
          console.log("User already signed-in Firebase.");
        }
      }.bind(this)
    );
  };

  _signIn = () => {
    try {
      this.setState({
        loading: true,
      });

      GoogleSignin.signIn().then((data) => {
        // create a new firebase credential with the token
        //this.onSignIn(data)
        //console.log(data);
        const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
        // login with credential
        return firebase.auth().signInWithCredential(credential);
      }).then((currentUser) => {
          console.log(`Google Login with user : ${JSON.stringify(currentUser.toJSON())}`);
        })
        .catch((error) => {
          console.log(`Login fail with error: ${error}`);
        });

      // let result = await GoogleSignin.signIn();
      // result.then((data) => {
      //   console.log(data)
      //   
      //   return data.accessToken
      // })
    } catch (error) {
      alert(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        alert('Cancel');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('Signin in progress');
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('PLAY_SERVICES_NOT_AVAILABLE');
        // play services not available or outdated
      } else {
        // some other error happened
      }
      this.setState({
        loading: false,
      });
      return { cancelled: true };
    }
  };

  signInWithGoogleAsync = async () => {
    console.log("calledhgh")

    this.setState({
      loading: true,
    });
    console.log(this.state.loading)
    try {
      GoogleSignin.configure({
        webClientId: "958420409934-h1ueiag5q9ca7d3q4u830g9kjn3c62to.apps.googleusercontent.com", // client ID of type WEB for your server(needed to verify user ID and offline access)
        offlineAccess: true,
        scopes: ["profile", "email"],
      });
      // await GoogleSignin.hasPlayServices();
      GoogleSignin.signIn().then((result) => {
        setTimeout(() => {
          console.warn({ userInfo: result });
          console.log("result - ", result);
          if (result.type === "success") {
            //this.onSignIn(result);
            setTimeout(() => {
              this.setState({
                loading: false,
              });
              this.shortToast("Login Success!");
            }, 1000);
            return result.accessToken;
          } else {
            this.setState({
              loading: false,
            });
            return { cancelled: true };
          }
        }, 3000)
      })


      // const result = await GoogleSignin.logInAsync({
      //   androidClientId:
      //     "958420409934-c6vqjtpcd4htva3ad9i836q0c4lkml57.apps.googleusercontent.com",
      //   iosClientId:
      //     "958420409934-n4kl3b1s5t801uri6qbnu60krnctu50p.apps.googleusercontent.com",
      //   scopes: ["profile", "email"],
      // });

    } catch (error) {
      alert(error)
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        this.setState({
          loading: false,
        });
        return { error: true };

      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('Signin in progress');
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('PLAY_SERVICES_NOT_AVAILABLE');
        // play services not available or outdated
      } else {
        this.setState({
          loading: false,
        });
        return { error: true };
      }
    };
  }

  //    renderButton(){
  //      if(this.state.loading === true){
  //      return   <View>
  //      <ActivityIndicator size="large"/>
  // </View>
  //      }
  //      return(
  //       <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
  //       <Text style={styles.buttonText}>Login</Text>
  //   </TouchableOpacity>
  //      );
  //    }
  handleFocus = () => this.setState({ isFocused: true });
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.Welcome}>
          <Text style={styles.texts}>Hello.</Text>
          <Text style={styles.texts}>Welcome Back</Text>
        </View>
        <View>
          <FontAwesome5 name="user-circle" size={50} color="#3498DB" />
        </View>
        <TextInput
          selectionColor={"#3498DB"}
          style={styles.inputBox}
          value={this.state.email}
          onChangeText={(email) => this.setState({ email })}
          placeholder="user@gmail.com"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.inputBox}
          value={this.state.password}
          onChangeText={(password) => this.setState({ password })}
          placeholder="Password"
          secureTextEntry={true}
        />
        <View style={styles.forgot}>
          <TouchableOpacity
            style={styles.forgotStyle}
            onPress={() => this.props.navigation.navigate("ForgotPassword")}
          >
            <Text style={{ fontSize: 15, color: "#3498DB" }}>
              forgot password?
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonStyle} onPress={this.handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        {this.state.loading ? <Loader loading={this.state.loading} /> : <></>}
        <TouchableOpacity
          onPress={() => this.props.navigation.replace("Signup")}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16, color: "#3498DB" }}>
            Create Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 10 }}
          onPress={this._signIn}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16, color: "#3498DB" }}>
            Sign In With Google
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    //backgroundColor:"gray"
  },
  Welcome: {
    width: "90%",
    marginBottom: 30,
  },
  inputBox: {
    width: "85%",
    margin: 5,
    padding: 12,
    fontSize: 16,
    borderColor: "#3498DB",
    borderBottomWidth: 2,
    borderTopWidth: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    textAlign: "center",
  },
  buttonStyle: {
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 5,
    alignItems: "center",
    backgroundColor: "#3498DB",
    borderColor: "#3498DB",
    borderWidth: 1,
    borderRadius: 5,
    width: 200,
  },
  forgot: {
    width: "85%",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  forgotStyle: {
    alignItems: "flex-end",
  },
  texts: {
    fontSize: 35,
    color: "black",
    fontWeight: "bold",
  },
});


