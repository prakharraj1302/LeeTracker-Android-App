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
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
 

const SearchBar = ({ refresh, setRefresh }) => {
  const [userName, onChangeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function showToast(msg) {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }

  const getUserData = async (userName) => {
    var json = null;
    console.log("GET SUBB");
    var myHeaders = new Headers();
    myHeaders.append("referer", "https://leetcode.com/%s/votrubac");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Cookie",
      "csrftoken=2fh1J8fR3kqtgbptItZQ3tw7I92UAXxmW5VWQ5H5RkqLdEn83OI9Kn5IMCgrRz4Z"
    );

    var graphql = JSON.stringify({
      query:
        "query getUserProfile\r\n($username: String!) {\r\n    # allQuestionsCount { difficulty count }\r\n    matchedUser(username: $username) {\r\n        username\r\n        githubUrl\r\n        twitterUrl\r\n        linkedinUrl\r\n         contributions { points } \r\n         profile { \r\n             ranking      userAvatar      realName      aboutMe      school      websites      countryName      company      jobTitle      skillTags      postViewCount      postViewCountDiff      reputation      reputationDiff      solutionCount      solutionCountDiff      categoryDiscussCount      categoryDiscussCountDiff\r\n             } \r\n         activeBadge {\r\n            displayName\r\n            icon\r\n          }\r\n \r\n    } \r\n} ",
      variables: { username: userName },
    });
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
      redirect: "follow",
    };

    try {
       const response = await fetch(
        "https://leetcode.com/graphql/votrubac",
        requestOptions
      );
      json = await response.json();
      console.log("---- FETCH DATA- ", json);
    } catch (error) {
      console.error(e);
    } finally {
     }
    return json;
  };
  const appendUserList = async (userName, userData) => {
    console.log("append----");
    var list = null;
    try {
      const value = await AsyncStorage.getItem("@UserList");
      if (value !== null) {
        // existing
        console.log("existing---");
         jsonData = value;
        console.log(jsonData);
        list = jsonData;
       } else {
        console.log("initial---");
        const jsonTemplate = JSON.stringify({ userData: {} });
        list = jsonTemplate;
      }
    } catch (e) {
      
      console.log(e);
      alert("error ");
      return null;
    }
    console.log("UPDATE BIO LIST");
    console.log(typeof list);
    var json = null;
    try {
      json = JSON.parse(list);
       console.log(json["userData"]);
      json["userData"][userName] = userData;
    } catch (e) {
      console.log(e, "in BIO updt");
    }
    try {
      const value = JSON.stringify(json);
      await AsyncStorage.setItem("@UserList", value);
      console.log("SAVED BIO data ", value);
    } catch (e) {
      // saving error
      console.log(e);
    }
  };

  const userAddRoutine = async (userName) => {
    const chk = await userNameValid(userName);
    if (chk) {
      const response = await getUserData(userName);
      console.log("RESPONSE RECEIVED");
      if (response !== null) {
        userData = {
          realName: response["data"]["matchedUser"]["profile"]["realName"],
          userAvatar: response["data"]["matchedUser"]["profile"]["userAvatar"],
          notifStatus: true,
        };
        console.log(userData);
        await appendUserList(userName, userData);
        console.log("USER ADDED", userName);
      } else {
        console.log("error in BIO fetch data");
      }
    } else {
      console.error("INVALID USER");
    }
  };
  const userNameValid = async (userName) => {
    console.log("CHK userName", userName);
    var myHeaders = new Headers();
    myHeaders.append("referer", "https://leetcode.com/%s/votrubac");
    myHeaders.append("Content-Type", "application/json");
 
    var graphql = JSON.stringify({
      query:
        "query getUserProfile($username: String!) {matchedUser(username: $username) {profile { realName}} } ",
      variables: { username: userName },
    });
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
      redirect: "follow",
    };

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://leetcode.com/graphql/votrubac",
        requestOptions
      );
      const json = await response.json();
      if (json.hasOwnProperty("errors")) {
        showToast("false");
        return false;
      }
      showToast("true");
      return true;
    } catch (e) {
      console.log("FETCH ____ ERROR - ", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  function addUser() {
    setIsLoading(true);

    console.log(userName);
      userAddRoutine(userName).then(() => {
      setRefresh((refersh) => !refersh);
    });

    setIsLoading(false);
  }
  return (
    <View>
      
      <TextInput
        // style={styles.input}
        placeholder="enter userid"
        // keyboardType="alphanumeric"
        onChangeText={onChangeText}
        value={userName}
      />
      <TouchableOpacity onPress={addUser}>
        <Text>USED ADD</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default SearchBar;
