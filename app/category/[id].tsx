import { useMemo, useCallback, useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchGenres, fetchMovieListByType } from "@/services/api";
import {
  genresCategories,
  typeCategories,
  categoryDisplayNames,
} from "@/constants/category";
import { icons } from "@/constants/icons";
import MovieCard from "@/components/cards/MovieCard";
import { Movie } from "@/interfaces/interfaces";
import HotMovieFlatlist from "@/components/lists/HotMovieFlatlist";

export default function Category() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const categoryId = Array.isArray(id) ? id[0] : id;

  const [isLoading, setIsLoading] = useState(true);
  const [moviesThisYear, setMoviesThisYear] = useState<Movie[]>([]);
  const [hotMovies, setHotMovies] = useState<Movie[]>([]);

  const fetchDataByCategoryType = useCallback(
    async (limit: string): Promise<Movie[]> => {
      try {
        if (genresCategories.includes(categoryId)) {
          return await fetchMovieListByType({ type_list: categoryId, limit });
        } else if (typeCategories.includes(categoryId)) {
          return await fetchGenres({ type_list: categoryId, limit });
        } else {
          console.warn("⚠️ Unknown category type:", categoryId);
          return [];
        }
      } catch (error) {
        console.error("❌ Error fetching data by category type:", error);
        return [];
      }
    },
    [categoryId]
  );

  const fetchMoviesThisYearByCategory = useCallback(async () => {
    const allMovies = await fetchDataByCategoryType("15");
    return allMovies.slice(0, 12);
  }, [fetchDataByCategoryType]);

  const fetchHotMovies = useCallback(async () => {
    const allMovies = await fetchDataByCategoryType("15");
    return allMovies.slice(0, 10);
  }, [fetchDataByCategoryType]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      const movies = await fetchMoviesThisYearByCategory();
      const hot = await fetchHotMovies();

      if (isMounted) {
        setMoviesThisYear(movies);
        setHotMovies(hot);
        setIsLoading(false);
      }
    };
    loadData();

    return () => {
      isMounted = false;
      setMoviesThisYear([]);
      setHotMovies([]);
    };
  }, [fetchMoviesThisYearByCategory, fetchHotMovies]);

  const moviesThisYearMemo = useMemo(
    () => moviesThisYear || [],
    [moviesThisYear]
  );
  const hotMoviesMemo = useMemo(() => hotMovies || [], [hotMovies]);

  // const renderItem = useCallback(({ item }: { item: Movie }) => {
  //   return <MovieCard {...item} />;
  // }, []);

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-10 mb-5 px-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/10 rounded-full p-2"
        >
          <Image
            source={icons.back}
            className="w-6 h-6"
            resizeMode="contain"
            tintColor="#E50914"
          />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold capitalize">
          {categoryDisplayNames[categoryId]}
        </Text>
        <TouchableOpacity onPress={() => router.push("/discover")}>
          <Image
            source={icons.search}
            className="w-8 h-8"
            resizeMode="contain"
            tintColor="#E50914"
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#E50914"
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          {/* Hot Movies Section */}
          {hotMoviesMemo.length > 0 && (
            <View className="mb-3">
              <HotMovieFlatlist data={hotMoviesMemo} />
            </View>
          )}

          {/* Latest Movies Title */}
          <Text className="text-lg text-white font-bold mb-3 px-5">
            Latest Movies
          </Text>

          {/* Movie Grid */}
          <FlatList
            data={moviesThisYearMemo}
            renderItem={({ item }) => <MovieCard {...item} />}
            keyExtractor={(item) => item._id?.toString() || item.slug}
            numColumns={3}
            removeClippedSubviews={false}
            columnWrapperStyle={{
              justifyContent: "flex-start",
              gap: 20,
              paddingRight: 5,
              marginBottom: 10,
            }}
            contentContainerStyle={{
              paddingBottom: 40,
              paddingHorizontal: 20,
            }}
          />
        </>
      )}
    </View>
  );
}
