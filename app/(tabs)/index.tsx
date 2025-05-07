import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { fetchLatestMovies, fetchMovieListByType } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import { Movie, TrendingMovie } from "@/interfaces/interfaces";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import TrendingSection from "@/components/section/TrendingSection";
import LatestSection from "@/components/section/LatestSection";
import HotMovieFlatlist from "@/components/lists/HotMovieFlatlist";

export default function Index() {
  const router = useRouter();

  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [hotMovies, setHotMovies] = useState<Movie[]>([]);
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);

  const [isHotLoaded, setIsHotLoaded] = useState(false);
  const [isTrendingLoaded, setIsTrendingLoaded] = useState(false);
  const [isLatestLoaded, setIsLatestLoaded] = useState(false);

  const isLoaded = isHotLoaded && isTrendingLoaded && isLatestLoaded;

  const [error, setError] = useState("");

  useEffect(() => {
    getTrendingMovies()
      .then((data) => setTrendingMovies(data ?? []))
      .catch((err) => setError(err.message || "Lỗi khi tải trending"))
      .finally(() => setIsTrendingLoaded(true));

    fetchMovieListByType({ type_list: "hoat-hinh", limit: "15" })
      .then((data) => setHotMovies(data.slice(0, 10)))
      .catch((err) => setError(err.message || "Lỗi khi tải hot movies"))
      .finally(() => setIsHotLoaded(true));

      fetchLatestMovies(1)
      .then((data) => setLatestMovies(data.slice(0, 9)))
      .catch((err) => setError(err.message || "Lỗi khi tải latest"))
      .finally(() => setIsLatestLoaded(true));

  }, []);

  return (
    <View className="flex-1 bg-black">
      <Image
        source={images.bg}
        className="absolute w-full h-80 top-0 left-0"
        resizeMode="cover"
      />

      <View className="z-10 flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-10 mb-5 px-5">
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

        {/* Nội dung */}
        {isLoaded ? (
          <FlatList
            data={[1]} // Render 1 lần
            keyExtractor={() => "movieSections"}
            renderItem={() => (
              <View>
                <HotMovieFlatlist data={hotMovies} />
                <TrendingSection trendingMovies={trendingMovies} />
                <LatestSection moviesThisYear={latestMovies} />
              </View>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#E50914" />
          </View>
        )}
      </View>
    </View>
  );
}
