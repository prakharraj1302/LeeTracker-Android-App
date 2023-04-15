import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MainPage from "../components/MainPage/MainPage";
import SearchBar from "../components/SearchBar/SearchBar";
import { UserList } from "../components/UserList/UserList";
import { useEffect, useState } from "react";
import { NotifPane } from "../components/NotifiPane/NotifPane";
import { register } from "../util/job";
// import {setActiveState}

const Index = () => {
  const [refresh, setRefresh] = useState(true);
  const [isActive, setActive] = useState(true);

  const setActiveState = () => {
    console.log("ACTIVE STATE" , isActive);
  };

  useEffect(() => {
    setActiveState();
    // register();
  },[]);

  return (
    <SafeAreaView>
      <NotifPane isActive={isActive} setActive={setActive} />
      <SearchBar refresh={refresh} setRefresh={setRefresh} />
      <UserList refresh={refresh} setRefresh={setRefresh} />
    </SafeAreaView>
  );
};

export default Index;
