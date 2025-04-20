import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View } from "react-native";
import { icons } from "@/constants/icons";
import { Movie } from "@/interfaces/interfaces";
import React from "react";

const ForYouCard = React.memo(function TVShowCard({
  slug,
  poster_url,
  name,
  quality,
  year,
}: Movie) {
  const baseUrl = "https://phimimg.com/";
  const fullPosterUrl = poster_url?.startsWith("http")
    ? poster_url
    : `${baseUrl}${poster_url}`;

  return (
   <Link href={`/movies/${slug}`} asChild>
      <TouchableOpacity className="w-[50%] rounded-lg">
        <View className="relative">
          <Image
            source={{ uri: fullPosterUrl }}
            className="w-full h-60 rounded-lg "
            resizeMode="cover"
          />
          <View className="absolute bottom-0 w-full bg-black/60 px-2 py-2 ">
            <Text
              className="text-white text-base font-semibold"
              numberOfLines={1}
            >
              {name}
            </Text>

            <View className="flex-row items-center justify-start gap-x-1">
                    <Image source={icons.star} className="size-4" />
              <Text className="text-xs text-white font-medium">
                {quality || "HD"}
              </Text>
              <Text className="text-xs text-white font-light">{year}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
});

export default ForYouCard;
