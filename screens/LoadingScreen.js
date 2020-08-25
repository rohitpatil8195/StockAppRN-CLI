import React, { Component } from "react";
import {
  ActivityIndicator,
  View,
  Image,
  StyleSheet,
} from "react-native";
import firebase from "firebase";

class LoadingScreen extends Component {
  state = { animating: true };

  componentDidMount = () => {
    setTimeout(() => {
      this.checkIfLoggedIn();

    },3000)
    //this.closeActivityIndicator();
  };

  render() {
    //const animating = this.state.animating;
    return (
      <View style={styles.container}>
        <Image
          style={{ height: "50%", width: "90%" }}
          source={require("../assets/splash_logo.gif")}
        />
        {/* <ActivityIndicator
          animating={animating}
          color="#4287f5"
          size="large"
          style={styles.activityIndicator}
        /> */}
      </View>
    );
  }

  closeActivityIndicator = () =>
    setTimeout(
      () =>
        this.setState({
          animating: false,
        }),
      60000
    );

  checkIfLoggedIn = () => {
    firebase.auth().onAuthStateChanged(
      function (user) {
        console.log("AUTH STATE CHANGED CALLED ");
        if (user) {
          this.props.navigation.replace("Home");
        } else {
          this.props.navigation.replace("Login");
        }
      }.bind(this)
    );
  };
}
export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  },
  activityIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 80,
  },
});
