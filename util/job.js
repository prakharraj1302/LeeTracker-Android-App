import * as React from "react";
import { useState, useEffect, useRef } from "react";

import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import * as Notifications from "expo-notifications";


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

  // Be sure to return the successful result type!
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

const register = () => {
  registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

  notificationListener.current = Notifications.addNotificationReceivedListener(
    (notification) => {
      setNotification(notification);
    }
  );

  responseListener.current =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener.current);
    Notifications.removeNotificationSubscription(responseListener.current);
  };
  checkStatusAsync();
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
const checkStatusAsync = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_FETCH_TASK
  );
  console.log(status, isRegistered);

  setStatus(status);
  setIsRegistered(isRegistered);
};

//-------------------------//-------------------------//-------------------------

//-------------------------//-------------------------//-------------------------

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
      const strTime = await AsyncStorage.getItem('@FetchUnix');
      if (strTime !== null) {
        const jsonTime = JSON.parse(strTime);
        return jsonTime['time'];
      } else {
        console.log('INITIAL CASE - unix not found');
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
      await AsyncStorage.setItem('@FetchUnix', jsonTime);
      console.log('SAVED TIME', jsonTime);
    } catch (e) {
      // saving error
      console.log('UNIX SAVING ERR', e);
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
};
//-------------------------//-------------------------//-------------------------

export { register, toggleFetchTask, checkStatusAsync };
