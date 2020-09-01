import React, { Component } from "react";
import {
  Text,
  FlatList,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import firebase from "firebase";
import { firebaseConfig } from "../config";
import Toast from "react-native-root-toast";
//import Icon from "react-native-vector-icons/FontAwesome";
import Icon from 'react-native-vector-icons/FontAwesome';

var name = "";
class StocksList extends Component {

  constructor() {
    super();
    this.database = firebase
      .database()
      .ref("/users/" + firebase.auth().currentUser.uid);
    this.state = {
      data: [],
      userWatchList: [],
      _isMounted: false
    };
  }

  getFirebaseData = () => {
    return new Promise((resolve, reject) => {
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
        resolve("Success");
      });
    });
  };

  isAlreadyAdded = (items) => {
    let final = this.state.userWatchList.filter((x) => x.Sid_s == items.Sid_s);
    if (final.length >= 1) {
      return true;
    }
    return false;
  };

  componentDidMount() {
    this.getFirebaseData().then((response) => {
      //console.log(this.state.userWatchList)
    });

    this.setState({
      _isMounted: true
    })
    if (this.props.stockname.length >= 3 && this.state._isMounted) {
      this.stockSearch(this.props.stockname);
    }
  }

  componentDidUpdate() {
    if (this.props.stockname.length >= 3 && this.state._isMounted) {
      if (name != this.props.stockname) {
        this.stockSearch(this.props.stockname);
      }
      name = this.props.stockname;
    }
    //console.log(this.state.data);
  }

  componentWillUnmount() {
    this.setState({
      _isMounted: false
    })
  }

  selectedStokData = (items) => {
    console.log("data :- ",items);
    let shortToast = (message) => {
      Toast.show(message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    };

    if (this.state.userWatchList.length >= 10) {
      shortToast("You can not add more than 10 scrip");
      return;
    }
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        var userId = firebase.auth().currentUser.uid;
        var new_watchlist = [];
        firebase
          .database()
          .ref("/users/" + userId)
          .once("value")
          .then(function (userData) {
            let maindata = JSON.parse(JSON.stringify(userData));
            if (maindata.watchlist != undefined) {
              //console.log(maindata.watchlist);
              Object.keys(maindata.watchlist).forEach((key) => {
                new_watchlist.push(maindata.watchlist[key]);
              });
            }
            let temp = {};
            temp["Seg_s"] = items["Seg_s"];
            temp["Sid_s"] = items["Sid_s"];
            temp["_Exch_s"] = items["_Exch_s"];
            temp["TradeSym_t"] = items["TradeSym_t"];
            temp["CUR_LTP"] = 0.0;
            temp["PRE_LTP"] = 0.0;
            temp["CHG_PER"] = 0.0;
            temp['CompName_t'] = items['CompName_t'];
            temp["KEY"] =
              items["Sid_s"] + "-" + items["Seg_s"] + "-" + items["_Exch_s"];
            new_watchlist.push(temp);

            shortToast("Added successfully");
            new_watchlist = new_watchlist.filter(
              (v, i, a) => a.findIndex((t) => t.Sid_s === v.Sid_s) === i
            );
          })
          .then(() => {
            firebase
              .database()
              .ref("/users/" + user.uid)
              .update({
                watchlist: new_watchlist,
              })
              .then(() => {
                //console.log("new_watchlist :- ", new_watchlist);
              });
          });
      }
    });
  };

  stockSearch = (stock) => {
    fetch(
      firebaseConfig.stock_serach_url.replace("____", stock.toUpperCase()),
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.state._isMounted) {
          this.setState({
            data: responseJson["response"]["docs"],
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    const style = StyleSheet.create({
      FlatList: {
        backgroundColor: "#F0F0F0",
        margin: 0,
        padding: 15,
      },
      Symbol: {
        fontSize: 17,
      },
      Exch: {
        fontSize: 10,
      },
      CompName_t: {
        fontSize: 13,
        marginBottom: 10,
        color: "#3598DB",
      },
      horizontalLine: {
        color: "black",
        borderWidth: 1,
        height: 1,
        marginTop: -5,
        marginBottom: 10,
        borderColor: "#F0F0F0",
      },
      icons: {
        alignSelf: "flex-end",
        justifyContent: "flex-end",
        position: "absolute",
        top: 2,
        right: 20,
        fontSize: 35,
        color: "#3598DB",
      },

      iconsCheck: {
        alignSelf: "flex-end",
        position: "absolute",
        top: 2,
        right: 20,
        fontSize: 35,
        color: "green",
      },
    });

    return (
      <View>
        <FlatList
          style={style.FlatList}
          data={this.state.data}
          keyExtractor={(item) => item.Sid_s}
          renderItem={({ item }) => (
            <View>
              <Text style={style.Symbol}>
                {item.TradeSym_t} <Text style={style.Exch}>{item._Exch_s}</Text>{" "}
              </Text>


              {this.isAlreadyAdded(item) ? (
                <Icon style={style.iconsCheck} name="check"></Icon>
              ) : (


                  <TouchableWithoutFeedback onPress={() => this.selectedStokData(item)}>
                    <Icon
                      style={style.icons}
                      name="plus"
                    ></Icon>
                  </TouchableWithoutFeedback>
                )}
              <Text style={style.CompName_t}>{item.CompName_t} </Text>
              <Text style={style.horizontalLine}></Text>
            </View>
          )}
        />
      </View>
    );
  }
}
export default StocksList;


// import React from 'react';
// import {Text,View} from 'react-native';

// const App =()=>{
//     return(
//         <View>
//             <Text>hello list</Text>
//         </View>
//     );
// }
// export default App;