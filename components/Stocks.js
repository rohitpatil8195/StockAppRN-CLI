import React from "react";
import { Text, View, StyleSheet, FlatList, Button } from "react-native";
 import { TextInput } from "react-native-paper";
import StocksList from "../screens/StockList";

const Stocks = (Props) => {
  const [text, setText] = React.useState("");

  return (
    <View >
      <TextInput
        style={style.TextInput}
        theme={{ colors: { text: "black", primary: "#3598DB" } }}
        label="Enter Scrip Name"
        value={text}
        onChangeText={(text) => setText(text)}
      />
      <View>
        <StocksList style={style.FlatList} navigation={Props.navigation} stockname={text} />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  TextInput: {
    backgroundColor: "#F0F0F0",
    margin: 10,
  }
});
export default Stocks;


// import React from 'react';
// import {Text,View} from 'react-native';

// const App =()=>{
//     return(
//         <View>
//             <Text>hello stocks</Text>
//         </View>
//     );
// }
// export default App;