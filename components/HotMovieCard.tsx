import { Image, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { Movie } from "@/interfaces/interfaces";

export default function HotMovieCard({ slug, poster_url, name, category }: Movie) {
  const fullPosterUrl = poster_url?.startsWith("http")
    ? poster_url
    : `https://phimimg.com/${poster_url}`;

  return (
    <Link href={`/movies/${slug}`} asChild>
      <TouchableOpacity >
        <View className="rounded-xl mx-auto w-full relative overflow-hidden">
          <Image
            source={{ uri: fullPosterUrl }}
            resizeMode="cover"
            className="w-full h-full"
          />
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center p-4 bg-black/50">
            <Text className="text-white text-xl font-bold text-center mb-1" numberOfLines={1}>
              {name}
            </Text>
            {category && category.length > 0 && (
              <Text className="text-gray-400 text-lg text-center" numberOfLines={1}>
                {category.map((c) => c.name).join(", ")}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

