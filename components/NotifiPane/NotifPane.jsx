import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { toggleFetchTask, checkStatusAsync } from "../../util/job";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
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

const NotifPane = ({ isActive, setActive }) => {
  function showToast(msg) {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }

  // -------------
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  // -------------

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  const BACKGROUND_FETCH_TASK = "background-fetch";

  // 1. Define the task by providing a name and the function that should be executed
  // Note: This needs to be called in the global scope (e.g outside of your React components
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const now = Date.now();
 
    await getNotifList();
 
    console.log(
      `Got background fetch call at date: ${new Date(now).toISOString()}`
    );
    return BackgroundFetch.BackgroundFetchResult.NewData;
  });

  // 1. Define the task by providing a name and the function that should be executed
  // Note: This needs to be called in the global scope (e.g outside of your React components)
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const now = Date.now();
 
    try {
      await updateRoutine();
      // await scheludeNotification();
      await getNotifList();
    } catch (e) {
      console.log("BK TASK ERR-", e);
    }

 

    // ---------

    console.log(
      `Got background fetch call at date: ${new Date(now).toISOString()}`
    );

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
  });

  // 2. Register the task at some point in your app by providing the same name,
  // and some configuration options for how the background fetch should behave
  // Note: This does NOT need to be in the global scope and CAN be used in your React components!
  async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 10, // task will fire 1 minute after app is backgrounded
    });
  }

  // 3. (Optional) Unregister tasks by specifying the task name
  // This will cancel any future background fetch calls that match the given name
  // Note: This does NOT need to be in the global scope and CAN be used in your React components!
  async function unregisterBackgroundFetchAsync() {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  }
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  const register = () => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
    checkStatusAsync();
  };
  async function schedulePushNotification(data) {
    console.log("schedule notif - start");
    console.log("DAAT ISSUEED -", data);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `👤 ${data["realName"]}`,
        body: `Latest 🗞️ ${data["title"]} \n Today's #️⃣ ${data["subb"]}`,
        data: { data: data["subb"] },
      },
      trigger: { seconds: 1 },
    });
  }

  const toggleFetchTask = async () => {
    if (isActive) {
      alert("dead");
      await unregisterBackgroundFetchAsync();
    } else {
      alert("alive");
      await registerBackgroundFetchAsync();
    }
    checkStatusAsync();
  };
  const checkStatusAsync = async () => {
     const isActive = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );
    console.log(isActive);

    // setStatus(status);
    setActive(isActive);
  };

  //-------------------------//-------------------------//-------------------------
  useEffect(() => {
    register();
  }, []);
  //-------------------------//-------------------------//-------------------------
  const getSubbData = async (userName) => {
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
        "query recentAcSubmissions($username: String!, $limit: Int!) {recentAcSubmissionList(username: $username limit:$limit) {id title titleSlug timestamp } }",
      variables: { username: userName, limit: 1 },
    });
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
      redirect: "follow",
    };

    const response = await fetch(
      "https://leetcode.com/graphql/votrubac",
      requestOptions
    );
    const json = await response.json();
    console.log("DATA- ", json);
    return json;
  };
  const getSubbs = async () => {
    var subbData = null;
    try {
      const value = await AsyncStorage.getItem("@UserSubbList");
      if (value !== null) {
        // value previously stored
        const jsonData = JSON.parse(value);
        subbData = jsonData;
        console.log("UserSubbList -", jsonData);
         return value;
      }
    } catch (e) {
       console.log(e);
      alert("error ");
      return null;
    }
    return subbData;
  };
  const getUsers = async () => {
    var userData = null;
    try {
      const value = await AsyncStorage.getItem("@UserList");
      if (value !== null) {
        // value previously stored
        const jsonData = JSON.parse(value);
        userData = jsonData;
        console.log("UserList -", jsonData);
   
      }
    } catch (e) {
       console.log(e);
      alert("error ");
      return null;
    }
    return userData;
  };
  const getCalendar = async (userName) => {
    console.log("GET Calendar");
    var myHeaders = new Headers();
    myHeaders.append("referer", "https://leetcode.com/%s/votrubac");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Cookie",
      "csrftoken=2fh1J8fR3kqtgbptItZQ3tw7I92UAXxmW5VWQ5H5RkqLdEn83OI9Kn5IMCgrRz4Z"
    );

    var graphql = JSON.stringify({
      query:
        "query userProfileCalendar($username: String!, $year: Int) {  matchedUser(username: $username) {   userCalendar(year: $year) {      activeYears      streak      totalActiveDays      dccBadges {        timestamp        badge {          name          icon        }      }      submissionCalendar    }  }}",
      variables: { username: userName, year: 2023 },
    });
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
      redirect: "follow",
    };

    const response = await fetch(
      "https://leetcode.com/graphql/votrubac",
      requestOptions
    );
    const json = await response.json();
    console.log("DATA- ", json);
    return json;
  };
  const processCalendar = async (userName) => {
    var response = null;
    var userCalendar = null;

    try {
      response = await getCalendar(userName);
    } catch (e) {
      console.log(e);
      return null;
    }
    if (response !== null) {
       json = response;
      const calendar =
        json["data"]["matchedUser"]["userCalendar"]["submissionCalendar"];
       userCalendar = calendar;
    } else {
      console.log("resposne null");
      return null;
    }
    return userCalendar;
  };
  const todaySubb = async (userName) => {
    console.log("CALENDAR - FOR - ", userName);
    var calendar = null;
    // var userCalendar = null;
    try {
      calendar = await processCalendar(userName);
    } catch (e) {
      console.log(e);
      return null;
    }
    if (calendar !== null) {
      // chk date generation
      const date = new Date();
      var subb = null;
      // Set the time to midnight
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      // Get the Unix timestamp
      const unixTimestamp = Math.floor((date.getTime() + 330 * 60000) / 1000);

      console.log(date.getTimezoneOffset());
      console.log("UNIX", unixTimestamp);
      // console.log(Object.keys(calendar));

      try {
        calendar = JSON.parse(calendar);
        console.log(calendar[unixTimestamp]);
        subb = calendar[unixTimestamp];
      } catch (e) {
        console.log(e);
      }
      if (subb !== null && subb !== undefined) {
        console.log(subb);
      } else {
        // console.log('SUBB TIME INVALID');
        subb = 0;
      }
    } else {
      console.log("resposne null");
      return null;
    }
    return subb;
  };

  const updateUserSubbList = async (userName, json) => {
    console.log("updateUserSubbList");
    var list = null;
    try {
      const value = await AsyncStorage.getItem("@UserSubbList");
      if (value !== null) {
        console.log("existing---SUBB");
        // value previously stored
        // const jsonData = JSON.parse(value);
        console.log("JSON SUBB DATA", value);
        list = value;
        // return value;
      } else {
        // console.log('NULL SUBBLIST' , value);
        console.log("initial---SUBB");
        const jsonTemplate = `{\"userSubbList\":{}}`;
        //  JSON.stringify({ userSubbList: { userName: {} } });
        list = jsonTemplate;
        console.log("templateSubb", list);
      }
    } catch (e) {
      // error reading value
      console.log("NULLL", e);
      alert("error ");
      return null;
    }
    console.log("UPDATE");

    try {
      list = JSON.parse(list);
      // const userSubb = list["userSubbList"];
      const subbId = json["id"];
      // console.log("ARGS ", userSubb, subbId);
      if (!Object.values(list["userSubbList"]).includes(subbId)) {
        // userSubb.push(json);
        // userSubb[userName][subbId] = json;
        if (list["userSubbList"][userName]) {
          list["userSubbList"][userName] = json;
        } else {
          list["userSubbList"][userName] = {};
          list["userSubbList"][userName] = json;
        }
      }
      // console.log("USER SUBB -", userSubb);
    } catch (e) {
      console.log("json error", e);
    }
    var copy = list[""];

    try {
      const value = JSON.stringify(list);
      await AsyncStorage.setItem("@UserSubbList", value);
      console.log("SAVED", value);
    } catch (e) {
      // saving error
      console.log(e);
    }
  };
  const updateRoutine = async () => {
    // get users list

    const list = await getUserList();
    try {
      const users = list["userData"];
      for (user in users) {
        console.log(user);
        const response = await getSubbData(user);
        if (response !== null) {
          subbData = response["data"]["recentAcSubmissionList"][0];
          const subb = await todaySubb(user);

          console.log(subb);
          subbData["totalSubbToday"] = subb;

          await updateUserSubbList(user, subbData);
          console.log("UPDATED");
        }
      }
    } catch (e) {
      console.log(e);
    }
    //----- REFRESH LIST -------//----- REFRESH LIST -------//----- REFRESH LIST -------
    var finalUserSubbList = null;
    try {
      const value = await AsyncStorage.getItem("@UserSubbList");
      if (value !== null) {
        // console.log("JSON SUBB DATA", value);
        const savedSubbList = JSON.parse(value);
        console.log("EXISTING", savedSubbList);
        // var copy = savedSubbList;
        // copy["userSubbList"] = {};
        for (u in savedSubbList["userSubbList"]) {
          console.log(u);
          if (savedSubbList["userSubbList"][u]["totalSubbToday"] === null) {
            console.log("EXISTING USER", user);
            delete json["userSubbList"][u];
            // copy["userSubbList"][user] = savedSubbList["userSubbList"][user];
          }
        }
        finalUserSubbList = savedSubbList;
        // return value;
      } else {
        console.log("UPDATE ERROR");
      }
    } catch (e) {
      // error reading value
      console.log("LIST UPDATION ERROR =---------", e);
      // alert("error ");
      return null;
    }
    console.log("UPDATEDED COPY _ _ ", finalUserSubbList);
    try {
      const value = JSON.stringify(finalUserSubbList);
      await AsyncStorage.setItem("@UserSubbList", value);
      console.log("SAVED", value);
    } catch (e) {
      // saving error
      console.log("COPY SAVE ERROR-  ---", e);
    }
    console.log("UPDATE");
    // var copy =
  };

  const getUserList = async () => {
    var list = null;
    try {
      const value = await AsyncStorage.getItem("@UserList");
      if (value !== null) {
        // value previously stored
        const jsonData = JSON.parse(value);
        console.log(jsonData);
        list = jsonData;
        // return value;
      }
    } catch (e) {
      // error reading value
      console.log(e);
      alert("error in get users");
    }
    return list;
  };

  async function getNotifList() {
    const jsonList = await scheludeNotification();
    try {
      if (jsonList !== null && jsonList !== undefined) {
        // const json = JSON.parse(strList);
        for (user in jsonList["notificationList"]) {
          schedulePushNotification(jsonList["notificationList"][user]);
        }
      }
    } catch (e) {
      console.log("ERR IN NOTIF ISSUE-", e);
    }
  }
  //-------------------------//-------------------------//-------------------------

  const getCurrentUnix = () => {
    return Math.floor(new Date().getTime() / 1000.0);
  };

  const getLastFetchUnix = async () => {
    try {
      const strTime = await AsyncStorage.getItem("@FetchUnix");
      if (strTime !== null) {
        const jsonTime = JSON.parse(strTime);
        setLastFetchUnix();
        return jsonTime["time"];
      } else {
        console.log("INITIAL CASE - unix not found");
        const currTime = getCurrentUnix();
        setLastFetchUnix();
        return currTime;
      }
    } catch (e) {
      console.log(e);
       return null;
    }
  };

  const setLastFetchUnix = async () => {
    try {
      const time = getCurrentUnix();
      const jsonTime = JSON.stringify({ time: time });
      await AsyncStorage.setItem("@FetchUnix", jsonTime);
      console.log("SAVED TIME", jsonTime);
    } catch (e) {
       console.log("UNIX SAVING ERR", e);
    }
  };

  const scheludeNotification = async () => {
    var notifRaw = '{"notificationList":{}}';
    var notifJson = JSON.parse(notifRaw);
    try {
      var userSubbList = await getSubbs();
      userSubbList = JSON.parse(userSubbList);
      var userData = await getUsers();
      console.log(userSubbList);
      console.log(userData);
 
      if (
        userSubbList === null ||
        userData === null ||
        userData === undefined ||
        userSubbList === undefined
      ) {
        console.log("ERROR IN GET DATA");
        return null;
      }
      try {
        const users = userData["userData"];
        console.log("users", users);
        
        const lastUnix =
            await getLastFetchUnix();

        for (user in users) {
          console.log(user);
          const notify = userData["userData"][user]["notifStatus"];
          const realName = userData["userData"][user]["realName"];
          const userAvatar = userData["userData"][user]["userAvatar"];

          const subb = userSubbList["userSubbList"][user]["totalSubbToday"];
          const title = userSubbList["userSubbList"][user]["title"];
          const titleSlug = userSubbList["userSubbList"][user]["titleSlug"];
          const timestamp = userSubbList["userSubbList"][user]["timestamp"];

 
          if (notify) {
            console.log("notif", user);
            if (timestamp > lastUnix) {
              console.log(timestamp, lastUnix);
              const notifData = {
                realName: realName,
                userAvatar: userAvatar,
                subb: subb,
                title: title,
              };
              console.log("nofi data added for = ", user);
              notifJson["notificationList"][user] = notifData;
            } else {
              console.log(timestamp, lastUnix);
              console.log("no update > time");
            }
          } else {
            console.log("no update");
          }
  
        }
      } catch (e) {
        console.log("ERRROR ", e);
        return null;
      }
    } catch (e) {
      console.log("ERRRO IN DATA GET", e);
      return null;
    }
    console.log("NOTF LIST- ", notifJson);
    return notifJson;
    //------------
    // const
  };
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          showToast(isActive.toString());
          //   checkStatusAsync();
          toggleFetchTask();

          setActive((isActive) => !isActive);
        }}
      >
        <Text>NOTIFICATION</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          showToast("NULL KEYS");

          const removeValue = async () => {
            try {
              await AsyncStorage.removeItem("@UserSubbList");
              await AsyncStorage.removeItem("@UserList");
            } catch (e) {
              // remove error
            }
            console.log("Done.");
          };
   

         }}
      >
        <Text>NULL KESY</Text>
      </TouchableOpacity>
    </View>
  );
};
export { NotifPane };
