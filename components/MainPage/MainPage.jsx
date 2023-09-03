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
} from "react-native";
import { useRouter } from "expo-router";
import { getUsers } from "../../util/backend";
import { userDataLoad } from "../../util/userDataLoad";

const MainPage = ({}) => {
  const [userData, setUserData] = useState([]);
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const userListRaw =
      '{"userData":{"prakharraj1302":{"realName":"PrakharRajPandey","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1647532784.png","notifStatus":true},"gauravgarwa":{"realName":"GauravGarwa","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1673192364.png","notifStatus":true},"votrubac":{"realName":"Vlad","userAvatar":"https://assets.leetcode.com/users/votrubac/avatar_1610271695.png","notifStatus":true},"user7519am":{"realName":"","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1680455541.png","notifStatus":true}}}';

    var userList = JSON.parse(userListRaw);
    uiList = [];
 
    var user = userList["userData"];
 
    for (u in user) {
      var ele = {
        userName: u,
        realName: user[u]["realName"],
        userAvatar: user[u]["userAvatar"],
        notifStatus: user[u]["notifStatus"],
      };
      uiList.push(ele);
    }
    setUserData(uiList);

   };
  
  const loadUserData2 = async () => {
    const json = await getUsers();
    copy = [];
    console.log(json);
    var user = json["userData"];

    for (u in user) {
      var ele = {
        userName: u,
        realName: user[u]["realName"],
        userAvatar: user[u]["userAvatar"],
        notifStatus: user[u]["notifStatus"],
      };
      copy.push(ele);
    }
    setUserData(copy);
  };

  // user data
  const loadUser1 = () => {
    const userListRaw =
      '{"userData":{"prakharraj1302":{"realName":"PrakharRajPandey","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1647532784.png","notifStatus":true},"gauravgarwa":{"realName":"GauravGarwa","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1673192364.png","notifStatus":true},"votrubac":{"realName":"Vlad","userAvatar":"https://assets.leetcode.com/users/votrubac/avatar_1610271695.png","notifStatus":true},"user7519am":{"realName":"","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1680455541.png","notifStatus":true}}}';

    var userList = JSON.parse(userListRaw);
    var user = userList["userData"];
 
    for (u in user) {
      var ele = {
        userName: u,
        realName: user[u]["realName"],
        userAvatar: user[u]["userAvatar"],
      };
      uiList.push(ele);
    }
    setUserData(uiList);

   };
  const loadUser2 = () => {
    const userListRaw =
      '{"userData":{"gauravgarwa":{"realName":"GauravGarwa","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1673192364.png","notifStatus":true},"votrubac":{"realName":"Vlad","userAvatar":"https://assets.leetcode.com/users/votrubac/avatar_1610271695.png","notifStatus":true},"user7519am":{"realName":"","userAvatar":"https://assets.leetcode.com/users/avatars/avatar_1680455541.png","notifStatus":true}}}';

    var userList = JSON.parse(userListRaw);
    uiList = [];
 
    var user = userList["userData"];
 
    for (u in user) {
      var ele = {
        userName: u,
        realName: user[u]["realName"],
        userAvatar: user[u]["userAvatar"],
      };
      uiList.push(ele);
    }
    setUserData(uiList);

   };
  function toggleNotif(userName) {
    console.log("Toggle", userName);
    copy = [];
    for (u in userData) {
      copy.push(userData[u]);
    }
    for (u in copy) {
      if (copy[u].userName == userName) {
        copy[u].notifStatus = !copy[u].notifStatus;
      }
    }
    console.log(copy);

    setUserData(copy);
  }

  function deleteUser(userName) {
    console.log("BEFORE", userData);
    // var copy = uiList;
    try {
      delete copy[userName];
    } catch (e) {
      console.log("ERROR IN DELETION", e);
    }

    copy = [];
    for (u in userData) {
      if (userData[u].userName != userName) {
        copy.push(userData[u]);
      }
    }

    setUserData(copy);
  }

  const ItemView = ({ item }) => (
    // <View style={styles.item}>
    <View style={styles.item}>
      <Text style={styles.title}>{item.userName}</Text>
      {item.notifStatus ? <Text>YES</Text> : <Text>NO</Text>}
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
  );

  return (
    <View>
      <Text>MainPage</Text>
      <TouchableOpacity onPress={loadUser1}>
        <Text>list 1 </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={loadUserData2}>
        <Text>list 2 </Text>
      </TouchableOpacity>
      <FlatList
        data={userData}
        keyExtractor={(item, index) => index.toString()}
         enableEmptySections={true}
        renderItem={ItemView}
 
      />
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: "#693fff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});
export default MainPage;
