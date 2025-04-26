import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";

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
  const currentYear = new Date().getFullYear();

  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [hotMovies, setHotMovies] = useState<Movie[]>([]);
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [trending, hot, latestPages] = await Promise.all([
          getTrendingMovies(),
          fetchMovieListByType({ type_list: "hoat-hinh", limit: "30" }),
          Promise.all([1, 2, 3, 4 , 5 ].map((p) => fetchLatestMovies(p))),
        ]);

        setTrendingMovies(trending ?? []);

        setHotMovies(hot.filter((movie) => movie.year === currentYear).slice(0, 10));

        const latestFlat = latestPages.flat();

        const filteredLatest = latestFlat
          .filter((movie) => movie.year === currentYear)
          .slice(0, 12);

        setLatestMovies(filteredLatest);
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Background Image */}
      <Image
        source={images.bg}
        className="absolute w-full h-80 top-0 left-0"
        resizeMode="cover"
      />

      {/* Header */}
      <View className="z-10 flex-1">
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

        {/* FlashList */}
        <FlatList
          data={[{ trending: trendingMovies, hot: hotMovies, latest: latestMovies }]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View>
              {item.hot.length > 0 && <HotMovieFlatlist data={item.hot} />}
              <TrendingSection trendingMovies={item.trending} />
              <LatestSection moviesThisYear={item.latest} />
            </View>
          )}
          ListFooterComponent={() => <View className="h-50" />}
        />
      </View>
    </View>
  );
}
