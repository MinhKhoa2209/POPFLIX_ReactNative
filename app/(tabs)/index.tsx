import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchLatestMovies, fetchMovieListByType } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import { Movie, TrendingMovie } from "@/interfaces/interfaces";
import { icons } from "@/constants/icons";
import HotMovieFlatlist from "@/components/HotMovieFlatlist";
import TrendingSection from "@/components/section/TrendingSection";
import LatestSection from "@/components/section/LatestSection";
import { images } from "@/constants/images";

export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const fetchLatestMoviesFivePages = async (): Promise<Movie[]> => {
    const pages = [1, 2, 3];
    const allMovies = await Promise.all(pages.map((p) => fetchLatestMovies(p)));
    return allMovies.flat();
  };

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch<Movie[]>(fetchLatestMoviesFivePages);

  const currentYear = new Date().getFullYear();
  const moviesThisYear = movies
    ?.filter((movie) => movie.year === currentYear)
    .slice(0, 12);

  const fetchHotMovies = async (): Promise<Movie[]> => {
    const response: Movie[] = await fetchMovieListByType({
      type_list: "hoat-hinh",
      limit: "30",
    });
    return response
      ?.filter((movie) => movie.year === currentYear)
      .slice(0, 10);
  };

  const {
    data: hotMovies,
    loading: hotMoviesLoading,
    error: hotMoviesError,
  } = useFetch<Movie[]>(fetchHotMovies);

  const isLoading = trendingLoading || moviesLoading || hotMoviesLoading;
  const hasError = trendingError || moviesError || hotMoviesError;

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Text className="text-red-500 text-center">
          Error: {trendingError?.message || moviesError?.message || hotMoviesError?.message}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">

      <Image
        source={images.bg}
        className="absolute w-full h-80 top-0 left-0"
        resizeMode="cover"
      />

      <View className="z-10">
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

        {/* FlatList */}
        <FlatList
          data={[{ trending: trendingMovies, hot: hotMovies, latest: moviesThisYear }]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View>
              {item.hot && item.hot.length > 0 && <HotMovieFlatlist data={item.hot} />}
              <TrendingSection trendingMovies={item.trending as TrendingMovie[]} />
              <LatestSection moviesThisYear={item.latest as Movie[]} />
            </View>
          )}
          ListFooterComponent={() => <View className="h-30" />}
        />
      </View>
    </View>
  );
}
