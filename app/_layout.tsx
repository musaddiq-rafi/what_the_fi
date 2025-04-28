import { SplashScreen } from "expo-router";
import "./global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Text, View , Image} from "react-native";
import icons from "@/constants/icons";



const TabIcon = ({focused, icon,title}:{focused:boolean; icon: any ; title: string}) => {
  return (
    <View className="flex-1 items-center mt-3 flex flex-col">
      <Image source={icon} tintColor={focused?'#0061ff':'#666876'} resizeMode="contain" className="size-6"/>
      <Text className={`${focused?'text-primary-300 font-rubik-medium':'text-black-200 font-rubik'} text-xs w-full text-center mt-1`}>
        {title}
      </Text>
    </View> 
  );
}

const TabsLayout = () => {
  return (
<Tabs
  screenOptions={({ route }) => {
    const isVisibleTab = route.name === "index" || route.name === "appsettings" || route.name === "devinfo";
    
    return {
      tabBarShowLabel: false,
      tabBarStyle: {
        position: "absolute",
        backgroundColor: "white",
        borderTopColor: "#0061FF1A",
        borderTopWidth: 1,
        minHeight: 70,
      },
      // Hide unwanted tabs
      tabBarButton: isVisibleTab ? undefined : () => null,
      // Apply special style to visible tabs for equal spacing
      tabBarItemStyle: isVisibleTab ? {
        flex: 1,
        width: '33.33%', // Each visible tab takes exactly 1/3 of the space
      } : {
        display: 'none', // Completely hide unwanted tabs
        width: 0,
      },
    };
  }}
>
      <Tabs.Screen name="index" options={{
      title: "Home",
      headerShown: false,
      tabBarIcon: ({focused}) => (
       <TabIcon focused={focused} icon={icons.home} title="Home" />
      )
      }} />
      <Tabs.Screen name="appsettings" options={{ 
      title: "Settings",
      headerShown: false,
      tabBarIcon: ({focused}) => (
       <TabIcon focused={focused} icon={icons.settings} title="Settings" />
      )
      }} />
      <Tabs.Screen name="devinfo" options={{ 
      title: "DevInfo",
      headerShown: false,
      tabBarIcon: ({focused}) => (
       <TabIcon focused={focused} icon={icons.info} title="DevInfo" />
      )
      }} />
    </Tabs>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  
  return <TabsLayout />;
}
