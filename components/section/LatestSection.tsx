import { FlatList, Text, View } from "react-native";
import MovieCard from "@/components/cards/MovieCard";
import { Movie } from "@/interfaces/interfaces";

const LatestSection = ({ moviesThisYear }: { moviesThisYear: Movie[] }) => {
  const currentYear = new Date().getFullYear();
  return (
    moviesThisYear && moviesThisYear.length > 0 && (
      <View className="mt-10 px-5">
        <Text className="text-lg text-white font-bold mb-3">
          Latest Movies ({currentYear})
        </Text>
        <FlatList
          data={moviesThisYear}
          renderItem={({ item }) => <MovieCard {...item} />}
          keyExtractor={(item) => item._id?.toString() ?? item.slug ?? Math.random().toString()}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 20,
            marginBottom: 10,
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    )
  );
};

export default LatestSection;
