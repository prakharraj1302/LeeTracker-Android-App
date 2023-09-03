import * as React from "react";
import { useState, useEffect, useRef } from "react";

import { Text, View, StyleSheet, Button, ToastAndroid } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import * as Notifications from "expo-notifications";

const gaurav = "gauravgarwa";
const vlad = "votrubac";
const demoId = "user7519am";

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
  // async () => {
  // await getData();
  await getNotifList();
  // }
  // alert('background');

  console.log(
    `Got background fetch call at date: ${new Date(now).toISOString()}`
  );

  // Be sure to return the successful result type!
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();
  // async () => {
  // await getData();
  // await getNotifList();
  // }
  // alert('background');

  // ---------
  //TODO
  // try blk
  //   update data
  try {
    await updateRoutine();
    // await scheludeNotification();
    await getNotifList();
  } catch (e) {
    console.log("BK TASK ERR-", e);
  }

  //   then
  //   scheludeNotification
  //   then
  //   show notif

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

export default function App() {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [status, setStatus] = React.useState(null);

  //---------
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  //---------

  React.useEffect(() => {
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
  }, []);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );
    console.log(status, isRegistered);

    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      alert("dead");
      await unregisterBackgroundFetchAsync();
    } else {
      alert("alive");
      await registerBackgroundFetchAsync();
    }
    checkStatusAsync();
  };
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text>
          Background fetch status:{" "}
          <Text style={styles.boldText}>
            {status && BackgroundFetch.BackgroundFetchStatus[status]}
          </Text>
        </Text>
        <Text>
          Background fetch task name:{" "}
          <Text style={styles.boldText}>
            {isRegistered ? BACKGROUND_FETCH_TASK : "Not registered yet!"}
          </Text>
        </Text>
      </View>
      <Button
        title={
          isRegistered
            ? "Unregister BackgroundFetch task"
            : "Register BackgroundFetch task"
        }
        onPress={toggleFetchTask}
      />
      <Button title="chk" onPress={checkStatusAsync} />
      <Button
        title="getData"
        onPress={async () => {
          await getData();
        }}
      />
      <Text style={styles.paragraph}>Sotrage</Text>
      <Button
        title="GET DATA"
        onPress={async () => {
          await getUser("gauravgarwa");
        }}
      />
      <Button
        title="load"
        onPress={async () => {
          await getUserData();
        }}
      />
      <Button
        title="USER ADD"
        onPress={async () => {
          await userAddRoutine(
            // vlad
            gaurav
            // "prakharraj1302"
            // demoId
          );
        }}
      />
      <Button
        title="UPDATE SUBB"
        onPress={async () => {
          await updateRoutine();
        }}
      />
      <Button
        title="get SUBB"
        onPress={async () => {
          await getSubbData("votrubac");
        }}
      />
      <Button
        title="NULL"
        onPress={async () => {
          await removeValue("votrubac");
        }}
      />
      <Button
        title="ALL KEYS"
        onPress={async () => {
          await getAllKeys();
        }}
      />
      <Button
        title="ALL users"
        onPress={async () => {
          await getUsers();
        }}
      />
      <Button
        title="ALL Subbs"
        onPress={async () => {
          await getSubbs();
        }}
      />
      <Button
        title="getCalendar"
        onPress={async () => {
          await todaySubb(gaurav);
        }}
      />
      <Button
        title="getNotifData"
        onPress={async () => {
          await scheludeNotification();
        }}
      />
      <Button
        title="CHK"
        onPress={async () => {
          await userNameValid("votrubaca");
        }}
      />
    </View>
  );
}
function showToast(msg) {
  ToastAndroid.show(msg, ToastAndroid.SHORT);
}

//---------------------------//---------------------------//---------------------------
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
function deleteUser(userName) {
  try {
    delete userList["userData"][userName];
  } catch (e) {
    console.log("ERROR IN DELETION", e);
  }
  try {
    updateListUI();
  } catch (e) {
    console.log("ERROR IN UI LIST UPDATION ", e);
  }
  // compo update
}
async function updateListUI(listUser) {
  try {
    const value = JSON.stringify(listUser);
    await AsyncStorage.setItem("@UserList", value);
    console.log("SAVED BIO data ", value);
  } catch (e) {
    // saving error
    console.log(e);
  }
}

async function getData() {
  console.log("GETDATA - start");
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
    variables: { username: "gauravgarwa", limit: 1 },
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
  console.log("api");
  // console.log(json);
  console.log(json.data.recentAcSubmissionList[0].title);
  schedulePushNotification(json);
}

async function schedulePushNotification(data) {
  console.log("schedule notif - start");
  console.log("DAAT ISSUEED -", data);
  await Notifications.scheduleNotificationAsync({
    content: {
      // title: data.data.recentAcSubmissionList[0].id,
      // body: data.data.recentAcSubmissionList[0].title,
      // // body: {JSON.stringify(data)},
      // data: { data: data.data.recentAcSubmissionList[0].timestamp },

      title: data["realName"],
      body: data["title"],
      // body: {JSON.stringify(data)},
      data: { data: data["subb"] },
    },
    trigger: { seconds: 1 },
  });
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
// todo = multiple styles

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   textContainer: {
//     margin: 10,
//   },
//   boldText: {
//     fontWeight: 'bold',
//   },
// });

//---------------------------//---------------------------//---------------------------

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

const userNameValid = async (userName) => {
  console.log("CHK userName", userName);
  var myHeaders = new Headers();
  myHeaders.append("referer", "https://leetcode.com/%s/votrubac");
  myHeaders.append("Content-Type", "application/json");
  // myHeaders.append(
  //   'Cookie',
  //   'csrftoken=2fh1J8fR3kqtgbptItZQ3tw7I92UAXxmW5VWQ5H5RkqLdEn83OI9Kn5IMCgrRz4Z'
  // );

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
  }
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
    // const json = JSON.parse(response);
    json = response;
    const calendar =
      json["data"]["matchedUser"]["userCalendar"]["submissionCalendar"];
    // console.log(calendar);
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

//---------------------------//---------------------------//---------------------------

const removeValue = async () => {
  try {
    await AsyncStorage.removeItem("@UserSubbList");
    await AsyncStorage.removeItem("@UserList");
  } catch (e) {
    // remove error
  }
  console.log("Done.");
};

const getAllKeys = async () => {
  let keys = [];
  try {
    keys = await AsyncStorage.getAllKeys();
  } catch (e) {
    // read key error
  }
  console.log(keys);
  // example console.log result:
  // ['@MyApp_user', '@MyApp_key']
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
      // list = jsonData;
      // return value;
    }
  } catch (e) {
    // error reading value
    console.log(e);
    alert("error ");
    return null;
  }
  return userData;
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
      // list = jsonData;
      return value;
    }
  } catch (e) {
    // error reading value
    console.log(e);
    alert("error ");
    return null;
  }
  return subbData;
};

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
    const userSubb = list["userSubbList"];
    const subbId = json["id"];
    console.log("ARGS ", userSubb, subbId);
    if (!Object.values(userSubb).includes(subbId)) {
      // userSubb.push(json);
      // userSubb[userName][subbId] = json;
      if (userSubb[userName]) {
        userSubb[userName] = json;
      } else {
        userSubb[userName] = {};
        userSubb[userName] = json;
      }
    }
  } catch (e) {
    console.log("json error", e);
  }

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

const userAddRoutine = async (userName) => {
  const response = await getUserData(userName);
  if (response !== null) {
    userData = {
      realName: response["data"]["matchedUser"]["profile"]["realName"],
      userAvatar: response["data"]["matchedUser"]["profile"]["userAvatar"],
      notifStatus: true,
    };
    await appendUserList(userName, userData);
    console.log("USER ADDED", userName);
  } else {
    console.log("error in BIO fetch data");
  }
};
const appendUserList = async (userName, userData) => {
  console.log("append----");
  var list = null;
  try {
    const value = await AsyncStorage.getItem("@UserList");
    if (value !== null) {
      // existing
      console.log("existing---");
      // const jsonData = JSON.parse(value);
      jsonData = value;
      console.log(jsonData);
      list = jsonData;
      // return value;
    } else {
      console.log("initial---");
      const jsonTemplate = JSON.stringify({ userData: {} });
      list = jsonTemplate;
    }
  } catch (e) {
    // error reading value
    console.log(e);
    alert("error ");
    return null;
  }
  console.log("UPDATE BIO LIST");
  console.log(typeof list);
  var json = null;
  try {
    json = JSON.parse(list);
    // const json = list;
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

const getUserData = async (userName) => {
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

  const response = await fetch(
    "https://leetcode.com/graphql/votrubac",
    requestOptions
  );
  const json = await response.json();
  console.log("DATA- ", json);
  return json;
};

const demo_1 = async (usreName) => {
  var myHeaders = new Headers();
  myHeaders.append("referer", "https://leetcode.com/%s/pete1302");
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

  const response = await fetch(
    "https://leetcode.com/graphql/votrubac",
    requestOptions
  );
  const json = await response.json();
  fetch("https://leetcode.com/graphql/votrubac", requestOptions)
    .then(function (response) {
      return response.json();
    })
    // .then(chkUser(data));{}
    .then(function (data) {
      console.log(data);
      const pr = new Promise(function (resolve, reject) {
        if (data.hasOwnProperty("errors")) {
          const err = new Error("invalid user");
          reject(err);
        } else {
          console.log("resolved");
          resolve(data);
        }
      });
      return pr;
    })
    .then(function (data) {
      try {
        console.log("STORING");
        console.log(data);

        const str_data = JSON.stringify(data);
        const userName = data.data.matchedUser.username;
        // await
        AsyncStorage.setItem(userName, str_data);
      } catch (e) {
        // saving error
        alert("ERROR IN SAVING");
      }
    })
    // .then(storeUser(data))
    .catch(function (err) {
      alert(err);
    });

  // schedulePushNotification(json);
};
const chkUser = async (data) => {
  console.log(data);
};

const storeUser = async (data) => {
  try {
    console.log("STORING");
    const str_data = JSON.stringify(data);
    const userName = data.data.matchedUser.username;
    await AsyncStorage.setItem(userName, str_data);
  } catch (e) {
    // saving error
    alert("ERROR IN SAVING");
  }
};
const getUser = async (userName) => {
  console.log("GETTING");
  try {
    const value = await AsyncStorage.getItem(userName);
    if (value !== null) {
      // value previously stored
      console.log(value);
    }
  } catch (e) {
    // error reading value
  }
};
// const
//===========================//===========================//===========================//===========================
//NOTIFICATION SCHEDULER-
const getCurrentUnix = () => {
  return Math.floor(new Date().getTime() / 1000.0);
};

const getLastFetchUnix = async () => {
  try {
    const strTime = await AsyncStorage.getItem("@FetchUnix");
    if (strTime !== null) {
      const jsonTime = JSON.parse(strTime);
      return jsonTime["time"];
    } else {
      console.log("INITIAL CASE - unix not found");
      const currTime = getCurrentUnix();
      setLastFetchUnix();
      return currTime;
    }
  } catch (e) {
    console.log(e);
    // alert("error fetching time");
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
    // saving error
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
    // const userTotalSubbToday = await get;

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
      const users = userSubbList["userSubbList"];
      console.log("users", users);

      for (user in users) {
        console.log(user);
        const notify = userData["userData"][user]["notifStatus"];
        const realName = userData["userData"][user]["realName"];
        const userAvatar = userData["userData"][user]["userAvatar"];

        const subb = userSubbList["userSubbList"][user]["totalSubbToday"];
        const title = userSubbList["userSubbList"][user]["title"];
        const titleSlug = userSubbList["userSubbList"][user]["titleSlug"];
        const timestamp = userSubbList["userSubbList"][user]["timestamp"];

        const lastUnix = getLastFetchUnix();
        // 1680757006;

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
            console.log("no update > time");
          }
        } else {
          console.log("no update");
        }
        // "title": "Search Insert Position",
        // "titleSlug": "search-insert-position",
        // "timestamp": "1680614162",
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

//===========================//===========================//===========================//===========================
const demoUser = async () => {
  //   const jsonStr = `"{\"userData\":{\"votrubac\":{\"realName\":\"Vlad\",\"userAvatar\":\"https://assets.leetcode.com/users/votrubac/avatar_1610271695.png\",\"notifStatus\":true},\"gauravgarwa\":{\"realName\":\"GauravGarwa\",\"userAvatar\":\"https://assets.leetcode.com/users/avatars/avatar_1673192364.png\",\"notifStatus\":true},\"prakharraj1302\":{\"realName\":\"PrakharRajPandey\",\"userAvatar\":\"https://assets.leetcode.com/users/avatars/avatar_1647532784.png\",\"notifStatus\":true},\"user7519am\":{\"realName\":\"\",\"userAvatar\":\"https://assets.leetcode.com/users/avatars/avatar_1680455541.png\",\"notifStatus\":true}}}"`;
  return jsonStr;
};

//===========================//===========================//===========================//===========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
export { userNameValid, userAddRoutine, getUsers };
