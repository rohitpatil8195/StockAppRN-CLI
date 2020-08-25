import React, { Component, Fragment } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
} from "react-native";
//import { TextInput } from 'react-native-paper';
import firebase from "firebase";
//import Icon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from "react-native-root-toast";

class ForgotPassword extends Component {
  state = {
    email: "",
  };

  ForgotPassword = () => {
    let shortToast = (message) => {
      Toast.show(message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    };
    var auth = firebase.auth();
    this.setState[{ email: null }];
    const { email } = this.state;
    auth
      .sendPasswordResetEmail(email)
      .then(function () {
        shortToast("password reset link send to email address");
      })
      .then(() => this.props.navigation.navigate("Login"))
      .catch(function (error) {
        alert(error);
      });
  };

  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={styles.Welcome}>
          <Text style={styles.texts}>Did someone</Text>
          <Text style={styles.texts}>Forgot their Password?</Text>
        </View>
        <View>
          <Icon name="unlock" size={50} color="#3498DB"></Icon>
        </View>
        <TextInput
          style={styles.inputBox}
          value={this.state.email}
          onChangeText={(email) => this.setState({ email })}
          placeholder="user@gmail.com"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={this.ForgotPassword}>
          <Text style={styles.buttonText}>Send Mail</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.navigation.goBack("Login")}>
          <Text style={{ fontWeight: "bold", fontSize: 16, color: "#3498DB" }}>
            Go Back To Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputBox: {
    width: "85%",
    margin: 10,
    padding: 10,
    fontSize: 16,
    borderColor: "#3498DB",
    borderBottomWidth: 2,
    textAlign: "center",
  },
  button: {
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
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  Welcome: {
    width: "90%",
    marginBottom: 30,
  },
  texts: {
    fontSize: 30,
    color: "black",
    fontWeight: "bold",
  },
});

export default ForgotPassword;
