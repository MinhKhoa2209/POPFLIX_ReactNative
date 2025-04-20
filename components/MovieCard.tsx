import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";
import { Movie } from "@/interfaces/interfaces";
import React from "react";

const MovieCard = React.memo(function MovieCard({ slug, poster_url, name, quality, year}: Movie)  {
  const baseUrl = "https://phimimg.com/";   
  const fullPosterUrl = poster_url?.startsWith("http")
  ? poster_url
  : `${baseUrl}${poster_url}`;

  return (
    <Link href={`/movies/${slug}`} asChild>
      <TouchableOpacity className="w-[30%] mb-4">
        <Image
          source={{
            uri: fullPosterUrl,
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {name}
        </Text>

        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs text-white font-bold uppercase">
            {quality || "HD"}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {year}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
});

export default MovieCard;
