import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { icons } from "@/constants/icons";

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <View
      className="flex flex-row min-w-[90px] w-[62px] h-[60px] mt-6 justify-center items-center rounded-full bg-primary-600" >
        <Image source={icon} tintColor="#FFFFFF" className="size-5" />
        <Text className="text-white text-base font-semibold ml-2">{title}</Text>
      </View>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-6 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
    </View>
  );
};

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#141414",
          borderRadius: 9999,
          marginHorizontal: 12,
          marginBottom: 36,
          height: 60,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: "#3A3A3C"
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Discover" />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Saved" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
