// import React from 'react';
// import {Text, View} from 'react-native';

// const HomeScreen=()=>{
//     return(
//       <View>
//         <Text>Home Screen</Text>
//       </View>
//     );
// };
// export default HomeScreen;

import React, { Component, useState } from "react";
import {
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Alert,
  Animated
} from "react-native";
//import { FAB, TouchableRipple } from "react-native-paper";
import ActionButton from "react-native-circular-action-menu";
//import { FontAwesome } from "@expo/vector-icons";
//import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from "firebase";
import { firebaseConfig } from "../config";
import Swipeable from "react-native-swipeable";
import Toast from "react-native-root-toast";
import { YellowBox } from 'react-native';

// const actions = [
//   {
//     text: "Add Stocks",
//    icon: require( <FontAwesome5 name="user-circle" color="#3498DB"  />),
//     name: "Add_Stock",
//     position: 1,
//   },
// ];

class stockWebSocket extends Component {
  // static navigationOptions = ({ navigation, screenProps }) => ({
  //   title: navigation.state.params.name + "'s Profile!",
  //   headerRight: <Button color={screenProps.tintColor} {...} />,
  // });
  animatedValue = new Animated.Value(0);
  websocket = new WebSocket(firebaseConfig.websocket);
  constructor() {
    super();
    this.database = firebase
      .database()
      .ref("/users/" + firebase.auth().currentUser.uid);
    this.state = {
      stateData: [],
      userWatchList: [],
      _isConnected: false,
      open: false,
    };
  }

  pad = (str, len, pad, dir) => {
    var STR_PAD_LEFT = 1;
    var STR_PAD_RIGHT = 2;
    var STR_PAD_BOTH = 3;
    if (typeof len == "undefined") {
      let len = 0;
    }
    if (typeof pad == "undefined") {
      let pad = " ";
    }
    if (typeof dir == "undefined") {
      let dir = STR_PAD_RIGHT;
    }
    if (len + 1 >= str.length) {
      switch (dir) {
        case STR_PAD_LEFT:
          str = Array(len + 1 - str.length).join(pad) + str;
          break;
        case STR_PAD_BOTH:
          let padlen = len - str.length;
          var right = Math.ceil(padlen / 2);
          var left = padlen - right;
          str = Array(left + 1).join(pad) + str + Array(right + 1).join(pad);
          break;
        default:
          str = str + Array(len + 1 - str.length).join(pad);
          break;
      } // switch
    }
    return str;
  };

  getFirebaseData = () => {
    this.database.on("value", (snapshot) => {
      let watchlist = [];
      let maindata = snapshot.val();
      if (maindata.watchlist != undefined) {
        Object.keys(maindata.watchlist).forEach((key) => {
          watchlist.push(maindata.watchlist[key]);
        });
      }
      this.setState({
        userWatchList: watchlist,
      });
      this.getScripBroadcastDataWS(this.state.userWatchList);
    });
  };

  componentDidMount() {
    Animated.timing(this.animatedValue,
      {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }).start();
    YellowBox.ignoreWarnings(['Animated: `useNativeDriver`']);
    this.props.navigation.addListener("focus", () => {

      this.websocket = new WebSocket(firebaseConfig.websocket);
      console.log("Screen.js focused");
      this.websocket.binaryType = "arraybuffer";
      var id = firebase.auth().currentUser.uid;
      this.websocket.onopen = function (e) {
        console.log("onopennnn");
        this.setState({
          _isConnected: true,
        });
        let position = 0;
        let arrbuffer = new ArrayBuffer(83);
        let view = new DataView(arrbuffer, 0, arrbuffer.byteLength);
        view.setInt8(position, 10);
        position++;
        view.setUint16(position, 83, true);
        position += 2;
        let id_pad = this.pad(id, 30, "", 2);
        // console.log("id_pad = " + id_pad);
        for (let i = 0; i < 30; i++) {
          view.setInt8(position, id_pad.charCodeAt(i));
          position++;
        }
        let name_pad = this.pad("", 50, "", 2);
        for (let i = 0; i < 50; i++) {
          view.setInt8(position, name_pad.charCodeAt(i));
          position++;
        }
        this.getFirebaseData();
        this.websocket.send(arrbuffer);
      }.bind(this);

      this.websocket.onmessage = (evt) => {
        let received_msg = evt.data;
        let totalLength = received_msg.byteLength;
        let totalRead = 0;
        let feedData = received_msg;
        while (totalRead < totalLength) {
          let scripid = new Uint32Array(feedData.slice(1, 5))[0];
          let msg_length = new Uint8Array(feedData.slice(9, 10))[0];
          totalRead += msg_length;
          let msg_type = new Uint8Array(feedData.slice(10, 11))[0];
          //console.log(msg_type)
          let seg = new Uint8Array(received_msg.slice(0, 1))[0].toString(); //seg id
          let secId = new Uint32Array(received_msg.slice(1, 5))[0].toString(); //sec id
          let tempkey = "";
          let tofix = 2;
          switch (seg) {
            case "0":
              tempkey = secId + "-" + "I-IDX";
              seg = "I";
              break;
            case "1":
              tempkey = secId + "-" + "E-NSE";
              seg = "E";
              break;
            case "2":
              tempkey = secId + "-" + "D-NSE";
              seg = "D";
              break;
            case "3":
              tempkey = secId + "-" + "C-NSE";
              seg = "C";
              tofix = 4;
              break;
            case "4":
              tempkey = secId + "-" + "E-BSE";
              break;
            case "5":
              tempkey = secId + "-" + "M-MCX";
              seg = "M";
              break;
            case "6":
              tempkey = secId + "-" + "M-NCDEX";
              seg = "M";
              break;
          }
          if (msg_type == 32) {
            console.log(
              new Float32Array(received_msg.slice(11, 15))[0].toString()
            );
          }
          if (msg_type == 1) {
            if (this.state._isConnected) {
              this.returnLTPOj(
                tempkey,
                parseFloat(
                  new Float32Array(received_msg.slice(11, 15))[0].toString()
                ).toFixed(2)
              ).then((data_watchlist) => {
                data_watchlist = data_watchlist.filter(
                  (v, i, a) => a.findIndex((t) => t.Sid_s === v.Sid_s) === i
                );
                if (data_watchlist.length == this.state.userWatchList.length) {
                  this.setState({
                    userWatchList: data_watchlist,
                  });
                  // this.database.update({
                  //   watchlist: data_watchlist,
                  // });
                }
              });
            }
          } else if (msg_type == 14) {
            this.sendHeartbeat();
          } else {
            // console.log(
            //   new Float32Array(received_msg.slice(1, 19))[0].toString()
            // );
          }
        }
      };

      this.websocket.onerror = (error) => {
        this.setState({
          _isConnected: false,
        });
        console.warn(error);
        //alert(error);
      };
    });
  }

  sendHeartbeat = () => {
    var id = firebase.auth().currentUser.uid;
    let position = 0;
    let arrbuffer = new ArrayBuffer(83);
    let view = new DataView(arrbuffer, 0, arrbuffer.byteLength);
    view.setInt8(position, 14);
    position++;
    view.setUint16(position, 83, true);
    position += 2;
    let id_pad = this.pad(id, 30, "", 2);
    for (let i = 0; i < 30; i++) {
      view.setInt8(position, id_pad.charCodeAt(i));
      position++;
    }
    let name_pad = this.pad(id, 50, "", 2);
    for (let i = 0; i < 50; i++) {
      view.setInt8(position, name_pad.charCodeAt(i));
      position++;
    }

    console.log("sending heartBeat======");
    this.websocket.send(arrbuffer);
  };

  returnLTPOj = (tempkey, CUR_LTP) => {
    return new Promise((resolve, reject) => {
      let watchlist = [];
      for (let i = 0; i < this.state.userWatchList.length; i++) {
        if (tempkey == this.state.userWatchList[i]["KEY"]) {
          if (CUR_LTP == 0.0) {
            continue;
          } else {
            watchlist.push({
              CUR_LTP: CUR_LTP,
              KEY: tempkey,
              PRE_LTP: this.state.userWatchList[i]["CUR_LTP"],
              CHG_PER: this.state.userWatchList[i]["CHG_PER"],
              CompName_t: this.state.userWatchList[i]["CompName_t"],
              Seg_s: this.state.userWatchList[i]["Seg_s"],
              Sid_s: this.state.userWatchList[i]["Sid_s"],
              TradeSym_t: this.state.userWatchList[i]["TradeSym_t"],
              _Exch_s: this.state.userWatchList[i]["_Exch_s"],
            });
          }
        } else {
          // let per = (CUR_LTP - this.state.userWatchList[i]["PRE_LTP"]) / CUR_LTP;
          // per = per * 100;
          watchlist.push({
            CUR_LTP: this.state.userWatchList[i]["CUR_LTP"],
            PRE_LTP: this.state.userWatchList[i]["PRE_LTP"],
            CHG_PER: this.state.userWatchList[i]["CHG_PER"],
            CompName_t: this.state.userWatchList[i]["CompName_t"],
            KEY: this.state.userWatchList[i]["KEY"],
            Seg_s: this.state.userWatchList[i]["Seg_s"],
            Sid_s: this.state.userWatchList[i]["Sid_s"],
            TradeSym_t: this.state.userWatchList[i]["TradeSym_t"],
            _Exch_s: this.state.userWatchList[i]["_Exch_s"],
          });
        }
      }
      resolve(watchlist);
    });
  };

  componentDidUpdate() {
    if (this.state._isConnected) {
      //   this.setState({});
      // this.websocket.close();
    }
  }

  // componentWillUnmount() {
  //   this.setState({});
  //   this.websocket.close();
  // }

  getScripBroadcastDataWS(data) {
    //console.log("data=======" + data.length);
    var id = "TEST01";
    for (let i = 0; i < data.length; i++) {
      // console.log("data[i]======="+data[i]._Exch_s)
      let req_code = 12;
      if (data[i]._Exch_s == "IDX") req_code = 24;
      let segExch = this.getSignalRSeg(data[i]._Exch_s, data[i].Seg_s);

      let position = 0;
      let arrbuffer = new ArrayBuffer(129);
      let view = new DataView(arrbuffer, 0, arrbuffer.byteLength);
      view.setInt8(position, req_code);
      position++;
      view.setUint16(position, 129, true);
      position += 2;
      let id_new = this.pad(id, 30, "", 2);
      for (let i = 0; i < 30; i++) {
        view.setInt8(position, id_new.charCodeAt(i));
        position++;
      }
      let name_new = this.pad("", 50, "", 2);
      for (let i = 0; i < 50; i++) {
        view.setInt8(position, name_new.charCodeAt(i));
        position++;
      }
      view.setInt8(position, segExch);
      position++;
      view.setInt32(position, -1);
      position += 4;
      view.setInt8(position, 1);
      position++;
      let id_pad = this.pad("abc", 20, "", 2);
      for (let i = 0; i < 20; i++) {
        view.setInt8(position, id_pad.charCodeAt(i));
        position++;
      }
      let name_pad = this.pad(data[i].Sid_s, 20, "", 2);
      for (let i = 0; i < 20; i++) {
        view.setInt8(position, name_pad.charCodeAt(i));
        position++;
      }
      this.websocket.send(arrbuffer);
    }
  }

  getSignalRSeg = (exch, seg) => {
    if (exch == "NSE") {
      if (seg == "E" || seg == "nse_cm") {
        return 1;
      } else if (seg == "D" || seg == "nse_fo") {
        return 2;
      } else if (seg == "C" || seg == "cde_fo") {
        return 3;
      }
    } else if (exch == "BSE") {
      if (seg == "E" || seg == "bse_cm") {
        return 4;
      } else if (seg == "C" || seg == "bcs_fo") {
        return 7;
      }
    } else if (exch == "MCX") {
      if (seg == "M" || seg == "mcx_fo") {
        return 5;
      }
    } else if (exch == "NCDEX") {
      if (seg == "M" || seg == "ncx_fo") {
        return 6;
      }
    } else if (exch == "IDX") {
      if (seg == "I") {
        return 0;
      }
    } else {
      return -1;
    }
  };

  addStockRedirect = () => {
    this.websocket.close();
    this.props.navigation.navigate("Stock");
  };

  logout = () => {
    firebase.auth().signOut();
    this.setState({});
    this.props.navigation.replace("Login");
  };

  refreshWebsocket = () => {
    this.forceUpdate();
  };

  deleteScrip(item) {
    var userId = firebase.auth().currentUser.uid;
    let new_watchlist = this.state.userWatchList.filter(
      (x) => x.Sid_s != item.Sid_s
    );
    firebase
      .database()
      .ref("/users/" + userId)
      .update({
        watchlist: new_watchlist,
      })
      .then(() => { });
    let shortToast = (message) => {
      Toast.show(message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    };
    shortToast(item.TradeSym_t + " deleted successfully...");
  }

  rightAction = (item) => {
    return [
      <TouchableWithoutFeedback onPress={() => this.deleteScrip(item)}>
        <View style={styles.delView}>
          <Text style={styles.delBtn}>delete</Text>
        </View>
      </TouchableWithoutFeedback>,
    ];
  };

  render() {
    return (
      <View>
        <View style={{ width: "100%", height: "100%" }}>
          {this.state._isConnected ? (
            <View>
              {this.state.userWatchList.length >= 1 ? (
                <FlatList
                  data={this.state.userWatchList}
                  keyExtractor={(item) => item.Sid_s}
                  renderItem={({ item, index }) => (
                    <Swipeable rightButtons={this.rightAction(item)}>
                      <View style={styles.flatList}>
                        <View
                          style={{
                            flexDirection: "row",
                            marginLeft: 3,
                            justifyContent: "space-between",
                          }}
                        >
                          <Text style={{ fontSize: 17 }}>
                            {item.TradeSym_t}{" "}
                            <Text
                              style={{
                                fontSize: 13,
                              }}
                            >
                              {item._Exch_s}
                            </Text>
                          </Text>

                          {item.CUR_LTP > item.PRE_LTP ? (
                            <Text style={{ color: "green", fontSize: 17 }}>
                              <Text>₹ </Text>
                              {item.CUR_LTP}
                            </Text>
                          ) : (
                              <Text style={{ color: "red", fontSize: 17 }}>
                                <Text>₹ </Text>
                                {item.CUR_LTP}
                              </Text>
                            )}
                        </View>
                        <View>
                          <Text style={{ fontSize: 13, color: "#3598DB" }}>
                            {" "}
                            {item.CompName_t}{" "}
                          </Text>
                        </View>
                      </View>
                    </Swipeable>
                  )}
                />
              ) : (
                  <View style={styles.noDataView}>
                    <Image
                      style={{ height: "50%", marginTop: "35%", width: "90%" }}
                      source={require("../assets/empty.gif")}
                    />
                    <Text style={styles.noDataText}>
                      You Don't Have any added script
                  </Text>
                  </View>
                )}
            </View>
          ) : (
              <View style={styles.noDataView}>
                <FontAwesome style={styles.noDataIcon} name="file-o" />
                <Image
                  style={{ height: "60%", marginTop: "30%", width: "90%" }}
                  source={require("../assets/somethingWrong.png")}
                />
                <Text style={styles.noDataText}>Connection lost !!!</Text>
                <Text style={styles.noDataText}>
                  Please refresh the application
              </Text>
              </View>
            )}
        </View>
        <ActionButton buttonColor="#3498DB" position="right">
          <ActionButton.Item
            buttonColor="#9b59b6"
            title="Add Stock"
            onPress={() => this.addStockRedirect()}
          >
            <FontAwesome name="plus-circle" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#3498db"
            title="refresh"
            onPress={() => this.sendHeartbeat()}
          >
            <FontAwesome name="refresh" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#1abc9c"
            title="Logout"
            onPress={() =>
              Alert.alert("Logout", "Are You Sure?", [
                {
                  text: "NO",
                  onPress: () => console.log("NO Pressed"),
                  style: "cancel",
                },
                { text: "YES", onPress: () => this.logout() },
              ])
            }
          >
            <MaterialCommunityIcons
              name="logout"
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
        </ActionButton>
      </View>
    );
    // } else {
    //   return (
    //     <Text>Oops Somthing Went Wrong Please try again some time !!!</Text>
    //   );
    // }
  }
}

const styles = StyleSheet.create({
  noDataView: {
    alignItems: "center",
  },
  noDataIcon: {
    color: "#3498DB",
    marginTop: 30,
    fontSize: 20,
  },
  noDataText: {
    marginTop: 6,
    fontSize: 20,
  },
  actionButtonIcon: {
    fontSize: 22,
    height: 24,
    color: "white",
    zIndex: 10
  },
  delView: {
    backgroundColor: "red",
    justifyContent: "center",
  },
  delBtn: {
    color: "#fff",
    padding: 20,
  },
  mainView: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    marginTop: 10,
  },
  flatList: {
    // backgroundColor: "white",
    flex: 1,
    padding: 12,
    // margin: 2,
    width: "98%",
    borderBottomColor: "#3498DB",
    borderBottomWidth: 1,
  },
  separatorViewStyle: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  separatorStyle: {
    height: 1,
    backgroundColor: "#000",
  },
});

export default stockWebSocket;
