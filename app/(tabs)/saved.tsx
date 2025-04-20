import { View, Text, Image, FlatList, ScrollView } from "react-native";
import { useGlobalContext } from "@/app/(auth)/AuthContext";
import { getFavoritesByUser } from "@/services/appwrite";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const Saved = () => {
  const { user, refetch } = useGlobalContext();
  const {
    data: favorites,
    loading,
    error,
    refetch: refetchFavorites,
  } = useFetch(() => getFavoritesByUser(user?.$id!), !!user);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        refetchFavorites();
      }
    }, [user?.$id])
  );

  return (
    <View className="bg-black flex-1">
     <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
     <View className="flex-row items-center justify-between mt-10 mb-5 px-5">
        <Text className="text-primary-600 text-3xl font-bold">POPFLIX</Text>   
      </View>
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <View className="flex-1 mt-10">
          {loading ? (
            <Text className="text-white text-center">Loading...</Text>
          ) : error ? (
            <Text className="text-red-500 text-center">Error: {error.message}</Text>
          ) : favorites?.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Image source={icons.save} className="size-10 mb-4" tintColor="#fff" />
              <Text className="text-gray-500 text-base">No saved movies yet.</Text>
            </View>
          ) : (
            <>
              <Text className="text-lg text-white font-bold mt-5 mb-3">Favorite Movies</Text>
              <FlatList
                data={favorites}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.slug}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="pb-32"
                scrollEnabled={false}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Saved;
