import { FlatList, Text, View } from "react-native";
import TrendingCard from "@/components/TrendingCard";
import { Movie, TrendingMovie } from "@/interfaces/interfaces";

const TrendingSection = ({ trendingMovies }: { trendingMovies: TrendingMovie[] }) => {
  return (
    trendingMovies && trendingMovies.length > 0 && (
      <View className="mt-10 px-5">
        <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
        <FlatList
          horizontal
          data={trendingMovies}
          renderItem={({ item, index }) => <TrendingCard movie={item} index={index} />}
          keyExtractor={(item) => item.movie_id.toString()}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-4" />}
          contentContainerStyle={{ paddingHorizontal: 2 }}
        />
      </View>
    )
  );
};

export default TrendingSection;
