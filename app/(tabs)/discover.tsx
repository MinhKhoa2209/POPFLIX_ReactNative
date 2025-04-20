import {
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import { fetchMovieListByType, searchMovies } from "@/services/api";
import SearchBar from "@/components/SearchBar";
import { updateSearchCount } from "@/services/appwrite";
import { Movie } from "@/interfaces/interfaces"; // Import kiểu Movie
import ForYouCard from "@/components/ForYouCard";

const ITEMS_PER_PAGE = 10;
const TOTAL_PAGES = 5;

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tvShows, setTVShows] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: movies,
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => searchMovies({ keyword: searchQuery }), false);

  useEffect(() => {
    const fetchTV = async () => {
      try {
        const typeListPool = ["tv-shows", "phim-le", "phim-bo", "hoat-hinh"];
        const results: Movie[] = [];
        const uniqueMap = new Map<string, Movie>();

        for (let i = 0; i < TOTAL_PAGES; i++) {
          const randomType =
            typeListPool[Math.floor(Math.random() * typeListPool.length)];
          const randomPage = Math.floor(Math.random() * 5) + 1;

          const pageData = await fetchMovieListByType({
            type_list: randomType,
            page: randomPage,
            limit: ITEMS_PER_PAGE.toString(),
          });

          pageData.forEach((item: Movie) => {
            if (!uniqueMap.has(item.slug)) {
              uniqueMap.set(item.slug, item);
            }
          });
        }

        setTVShows(
          Array.from(uniqueMap.values()).slice(0, TOTAL_PAGES * ITEMS_PER_PAGE)
        );
      } catch (err) {
        console.log("❌ Lỗi khi fetch TV shows:", err);
      }
    };

    fetchTV();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        loadMovies();
      } else {
        reset();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() && movies?.length > 0 && movies?.[0]) {
      try {
        updateSearchCount(searchQuery, movies[0]);
      } catch (err) {
        console.log("❌ Lỗi trong updateSearchCount:", err);
      }
    }
  }, [movies]);

  const paginatedTVShows = tvShows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <View className="flex-1 bg-black">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <View className="flex-row items-center justify-between mt-10 mb-5 px-5">
        <Text className="text-primary-600 text-3xl font-bold">POPFLIX</Text>
      </View>

      <View className="my-5 px-5">
        <SearchBar
          placeholder="Search movies..."
          value={searchQuery}
          onChangeText={(text: string) => setSearchQuery(text)}
        />
      </View>

      {searchQuery.trim() ? (
        <FlatList
          data={movies}
          renderItem={({ item }: { item: Movie }) => <MovieCard {...item} />}
          keyExtractor={(item) =>
            item._id?.toString() ?? item.slug ?? Math.random().toString()
          }
          className="px-5"
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 16,
            marginVertical: 16,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <>
              {loading && (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  className="mt-3"
                />
              )}
              {error && (
                <Text className="text-red-500 px-5 my-3">
                  Error: {error?.message}
                </Text>
              )}
              {!loading && !error && movies?.length > 0 && (
                <Text className="text-xl text-white font-bold px-2">
                  Search result for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
            </>
          }
          ListEmptyComponent={
            !loading && !error ? (
              <View className="mt-10 px-5">
                <Text className="text-center text-gray-500">
                  No movies found
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <>
          <View className="flex-row justify-between items-center mb-3 px-5">
            <Text className="text-2xl text-white font-bold">For You</Text>

            <View className="flex-row items-center gap-5">
              <TouchableOpacity
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <Text
                  className={`text-white text-sm ${
                    currentPage === 1 ? "opacity-30" : "opacity-100"
                  }`}
                >
                  ⬅ Prev
                </Text>
              </TouchableOpacity>

              <Text className="text-white font-bold text-sm">{`Page ${currentPage} / ${TOTAL_PAGES}`}</Text>

              <TouchableOpacity
                disabled={currentPage === TOTAL_PAGES}
                onPress={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, TOTAL_PAGES))
                }
              >
                <Text
                  className={`text-white text-sm ${
                    currentPage === TOTAL_PAGES ? "opacity-30" : "opacity-100"
                  }`}
                >
                  Next ➡
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={paginatedTVShows}
            renderItem={({ item }: { item: Movie }) => <ForYouCard {...item} />}
            keyExtractor={(item) => item.slug ?? Math.random().toString()}
            numColumns={2}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 60 }}
            columnWrapperStyle={{
              gap: 12,
              justifyContent: "space-between",
              marginBottom: 16,
              paddingHorizontal: 10,
            }}
          />
        </>
      )}
    </View>
  );
};

export default Discover;
