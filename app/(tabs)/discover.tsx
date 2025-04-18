import { Text, View, Image, FlatList, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import { searchMovies } from "@/services/api";
import SearchBar from "@/components/SearchBar";
import { updateSearchCount } from "@/services/appwrite";
import { Movie } from "@/interfaces/interfaces";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: movies,
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => searchMovies({ keyword: searchQuery }), false);

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
        console.log(movies[0]);
      } catch (err) {
        console.log("❌ Lỗi trong updateSearchCount:", err);
      }
    }
  }, [movies]);

  return (
    <View className="flex-1 bg-black">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
      <View className="flex-row items-center justify-between mt-16 mb-5 px-5">
        <Text className="text-primary-600 text-3xl font-bold">POPFLIX</Text>
      </View>
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
            <View className="my-5">
              <SearchBar
                placeholder="Search movies..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>

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

            {!loading && !error && searchQuery.trim() && movies?.length > 0 && (
              <Text className="text-xl text-white font-bold px-2">
                Search result for{" "}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error && searchQuery.trim() ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">No movies found</Text>
            </View>
          ) : null
        }
        
      />
    </View>
  );
};

export default Discover;
