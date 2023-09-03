import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  Button,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const UserList = ({ refresh, setRefresh }) => {
   const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [counter, update] = useState(0);
  

  //-------------//-------------//-------------//-------------//-------------
  function deleteUser(userName) {
 
    copy = [];
    for (u in data) {
      if (data[u].userName != userName) {
        copy.push(data[u]);
      }
    }
    setData(copy);
    // console.log(data);
    console.log("GLOBAL STATE ----", data);
    // updateListUI();
  }
  //-------------//-------------//-------------//-------------//-------------//-------------
  function toggleNotif(userName) {
    console.log("Toggle", userName);
    copy = [];
    for (u in data) {
      copy.push(data[u]);
    }
    for (u in copy) {
      if (copy[u].userName == userName) {
        copy[u].notifStatus = !copy[u].notifStatus;
      }
    }
    console.log(copy);
    setData(copy);
 
  }

  const loadUsers = async () => {
    var userData = null;
    try {
      const value = await AsyncStorage.getItem("@UserList");
      // if (value !== null) {
      if (true) {
        // value previously stored
        const jsonData = JSON.parse(value);

        const userListRaw =
          '{"userData":{"prakharraj1302":{"realName":"PrakharRajPandey","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1647532784.png","notifStatus":true},"gauravgarwa":{"realName":"GauravGarwa","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1673192364.png","notifStatus":true},"votrubac":{"realName":"Vlad","userAvatar":"https://assets.leetcode.com/users/votrubac/avatar_1610271695.png","notifStatus":true},"user7519am":{"realName":"","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1680455541.png","notifStatus":true}}}';

        // var jsonData = JSON.parse(userListRaw);

        // userData = jsonData;
        console.log("LOADED DATA -", jsonData);

        uiList = [];
        var user = jsonData["userData"];

        for (u in user) {
          var ele = {
            userName: u,
            realName: user[u]["realName"],
            userAvatar: user[u]["userAvatar"],
            notifStatus: user[u]["notifStatus"],
          };
          uiList.push(ele);
        }
        // console.log(uiList);
        setData(uiList);
      }
    } catch (e) {
      // error reading value
      console.log(e);
      alert("error ");
      return null;
    } finally {
      setIsLoading(false);
    }
    return userData;
  };

  async function updateListUI() {
    var uiList = data;
    var newJson = { userData: {} };

    if(uiList != null){
      for (i = 0; i < uiList.length; i++) {
        console.log(uiList[i]);
        newJson["userData"][uiList[i]["userName"]] = {
          realName: uiList[i]["realName"],
          userAvatar: uiList[i]["userAvatar"],
          notifStatus: uiList[i]["notifStatus"],
        };
      }
    }
    console.log("______ NEWJSON ", newJson);

    try {
      const value = JSON.stringify(newJson);
      await AsyncStorage.setItem("@UserList", value);
      console.log("SAVED BIO data ", value);
    } catch (e) {
      // saving error
      console.log(e);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);
  useEffect(() => {
    console.log("refershing -----------");

    reLoadUsers();
  }, [refresh]);

  useEffect(() => {
    update((counter) => counter + 1);
    updateListUI();
    console.log(
      "---------------------------DATA CHNGED------------------",
      counter
    );
  }, [data]);

  const reLoadUsers = () => {
    // updateListUI().then(()=> {
    setIsLoading(true);
    loadUsers();
    // })
  };

 
  const ItemView = ({ item }) => (
    // <View style={styles.item}>
    <TouchableWithoutFeedback>
      <View style={styles.item}>
        <Text style={styles.title}>{item.realName}</Text>
        <Text style={styles.subTitle}>{item.userName}</Text>
         <Button
          onPress={() => {
            console.log(item.userName);
            deleteUser(item.userName);
          }}
          title="DELETE"
        />
        <Button
          onPress={() => {
            console.log(item.userName);
            toggleNotif(item.userName);
          }}
          title="NOTIF"
        />
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView style={styles.container}>
       <Text>----USERLIST------</Text>
      <TouchableOpacity onPress={reLoadUsers}>
        <Text>REFRESH</Text>
      </TouchableOpacity>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
         <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          enableEmptySections={true}
          renderItem={ItemView}
        />
       )}
     </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  subTitle: {
    fontSize: 20,
  },
});

export { UserList };
