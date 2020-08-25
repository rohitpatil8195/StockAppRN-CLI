import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Button,
  NavigationEvents,
} from "react-native";
import Toast from "react-native-root-toast";
import firebase from "firebase";
import Loader from "./loader";
//import { FontAwesome5 } from "@expo/vector-icons";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
class Signup extends React.Component {
  state = {
    name: "",
    email: "",
    password: "",
    error: "",
    validated: false,
    loading: false,
  };

  shortToast = (message) => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
    });
  };

  handleSignUp = () => {
    const { email, password } = this.state;
    this.setState([{ error: "" }]);
    var EmailVal = false;
    var passVal = false;
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(this.state.email) === true) {
      EmailVal = true;
      if (this.state.password.length >= 8) {
        passVal = true;
      } else {
        this.shortToast("Password is too short");
      }
    } else {
      this.shortToast("Enter Correct Username");
    }
    if (EmailVal && passVal) {
      this.setState({
        loading: true,
      });
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((user) => {
          var key = firebase.auth().currentUser.uid;
          firebase
            .database()
            .ref("/users/" + key)
            .set({
              firstname: "",
              lastname: "",
              email: email,
              password: password,
              profile_pic: "",
              watchlist: [],
            });
        })
        .then(() => {
          this.setState({
            loading: false,
          });
          this.shortToast("Account Created Successfully");
        })
        
        .then(() => this.props.navigation.replace("Home"))
        .catch((error) => {
          console.log(error);
          this.setState({
            loading: false,
          });
          this.shortToast("oops something went wrong with email");
          this.setState({ error: "Authentication Failed" });
        });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.Welcome}>
          <Text style={styles.texts}>Create New</Text>
          <Text style={styles.texts}>Account Here</Text>
        </View>
        <View>
          <FontAwesome5 name="user-plus" size={40} color="#3498DB" />
        </View>
        {this.state.loading ? (
          <Loader loading={this.state.loading} />
        ) : (
          <Text></Text>
        )}
        {/* <TextInput
          style={styles.inputBox}
          value={this.state.name}
          onChangeText={(name) => this.setState({ name })}
          placeholder="Full Name"
        /> */}
        <TextInput
          style={styles.inputBox}
          value={this.state.email}
          onChangeText={(email) => this.setState({ email })}
          placeholder="Enter Email"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.inputBox}
          value={this.state.password}
          onChangeText={(password) => this.setState({ password })}
          placeholder="Password"
          secureTextEntry={true}
        />
        {/* <Text style={{color:'red', margin:1}}>
                    {this.state.error}
                </Text> */}
        <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.navigation.replace("Login")}>
          <Text style={{ fontWeight: "bold", fontSize: 16, color: "#3498DB" }}>
            Go Back To Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    alignItems: "center",
    justifyContent: "center",
  },
  Welcome: {
    width:"90%",
    marginBottom:30,
  },
  texts: {
    fontSize: 35,
    color: "black",
    fontWeight: "bold",
  },
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
  buttonSignup: {
    fontSize: 12,
  },
});

export default Signup;
