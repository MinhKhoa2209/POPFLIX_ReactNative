import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  typeCategories,
  genresCategories,
  categoryIcons,
  movieIcons,
  categoryColorMap,
  categoryDisplayNames, 
} from "../../constants/category";
import { useRouter } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

const Category = () => {
  const [activeTab, setActiveTab] = useState<"type" | "movie">("type");
  const router = useRouter();

  const renderCategory = (data: string[], icons: Record<string, string>) => (
    <View className="flex-row flex-wrap gap-3">
      {data.map((item) => {
        const iconName = icons[item] as keyof typeof MaterialIcons.glyphMap;
        const bg = categoryColorMap[item] ?? "#444";

        return (
          <TouchableOpacity
            key={item}
            onPress={() => {
              router.push(`/category/${item}`);
            }}
            className="w-[31.33%] h-28 rounded-xl justify-center items-center"
            style={{ backgroundColor: bg }}
          >
            <MaterialIcons name={iconName} size={28} color="white" />
            <Text className="text-white mt-2 text-sm font-medium text-center px-1">
              {categoryDisplayNames[item]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View className="flex-1 bg-black relative">
      {/* Background Image */}
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />
      {/* Header */}
      <View className="flex-row items-center justify-between mt-10 mb-5 px-5 z-10">
        <Text className="text-primary-600 text-3xl font-bold">POPFLIX</Text>
        <TouchableOpacity onPress={() => router.push("/discover")}>
          <Image
            source={icons.search}
            className="w-8 h-8"
            resizeMode="contain"
            tintColor="#E50914"
          />
        </TouchableOpacity>
      </View>

      {/* Tab Buttons */}
      <View className="flex-row justify-center mb-4 px-4 z-10">
        {(["type", "movie"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-[0.4] py-3 rounded-full ${
              activeTab === tab ? "bg-red-600" : "bg-background-dark"
            }`}
          >
            <Text className="text-white font-semibold text-center">
              {tab === "type" ? "Genres" : "Types"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ScrollView */}
      <ScrollView
        className="px-4 py-6 z-10"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {activeTab === "type"
          ? renderCategory(typeCategories, categoryIcons)
          : renderCategory(genresCategories, movieIcons)}
      </ScrollView>
    </View>
  );
};

export default Category;
