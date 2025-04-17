import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchLatestMovies, fetchMovieListByType } from "@/services/api";
import MovieCard from "@/components/MovieCard";
import { getTrendingMovies } from "@/services/appwrite";
import TrendingCard from "@/components/TrendingCard";
import { Movie } from "@/interfaces/interfaces";
import Carousel from "@/components/HotMovieCarousel";


export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const fetchLatestMoviesFivePages = async (): Promise<Movie[]> => {
    const pages = [1, 2, 3, 4, 5];
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
    const filtered = response
      ?.filter((movie) => movie.year === currentYear)
      .slice(0, 10);
    return filtered;
  };

  const {
    data: hotMovies,
    loading: hotMoviesLoading,
    error: hotMoviesError,
  } = useFetch<Movie[]>(fetchHotMovies);

  const { width: screenWidth } = Dimensions.get("window");
  return (
    <View className="flex-1 bg-black">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />
      <View className="flex-row items-center justify-between mt-16 mb-5 px-5">
        <Text className="text-primary-600 text-3xl font-bold">POPFLIX</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Image
            source={icons.search}
            className="w-8 h-8 "
            resizeMode="contain"
            tintColor="#E50914"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        {moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#00f"
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <Text className="text-red-500">
            Error: {moviesError?.message || trendingError?.message}
          </Text>
        ) : (
          <View className="flex-1 mt-5">
            {hotMovies && <Carousel data={hotMovies} />}
            {trendingMovies && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">
                  Trending Movies
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 mt-3"
                  data={trendingMovies}
                  contentContainerStyle={{ gap: 26 }}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                />
              </View>
            )}

            {/* Latest Movies */}
            {moviesThisYear && (
              <>
                <Text className="text-lg text-white font-bold mt-5 mb-3">
                  Latest Movies ({currentYear})
                </Text>
                <FlatList
                  data={moviesThisYear}
                  renderItem={({ item }) => <MovieCard {...item} />}
                  keyExtractor={(item) =>
                    item._id?.toString() ??
                    item.slug ??
                    Math.random().toString()
                  }
                  numColumns={3}
                  columnWrapperStyle={{
                    justifyContent: "flex-start",
                    gap: 20,
                    paddingRight: 5,
                    marginBottom: 10,
                  }}
                  className="mt-2 pb-32"
                  scrollEnabled={false}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
