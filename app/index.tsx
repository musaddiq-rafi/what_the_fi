import { Link } from "expo-router";
import { Text, View } from "react-native";
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="font-rubik text-3xl my-10">WhatTheFi ? Track it, or regret it.</Text>
      <Link href="/home">Home</Link>
      <Link href="/appsettings">Settings</Link> 
      <Link href="/devinfo"> DevInfo</Link>
    </View>
  );
}
