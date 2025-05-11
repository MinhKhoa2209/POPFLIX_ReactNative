import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";

import { fetchMovieDetails, fetchMovieVideos } from "@/services/api";
import { icons } from "@/constants/icons";
import { Comment, Episode, InteractionMovie } from "@/interfaces/interfaces";
import {
  checkIfFavorite,
  checkIfLike,
  saveToInteractions,
  unsaveFavorite,
  unsaveLike,
  getCommentsForMovie,
  submitComment,
  submitRating,
  checkIfComment,
  checkIfRating,
  getAverageRating,
  getTotalLikes,
} from "@/services/appwrite";
import { useGlobalContext } from "@/app/(auth)/AuthContext";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MovieInfo = ({
  label,
  value,
  isFullRow = false,
}: {
  label: string;
  value?: string | number | null;
  isFullRow?: boolean;
}) => (
  <View
    className={`mt-4 ${
      isFullRow
        ? "flex-col items-start"
        : "flex-row justify-between items-center"
    }`}
  >
    <Text className="text-white text-sm font-medium opacity-70 w-1/3">
      {label}
    </Text>
    <Text
      className={`text-white font-semibold text-sm ${
        isFullRow ? "mt-2 w-full" : "pl-3 w-2/3"
      }`}
    >
      {value || "N/A"}
    </Text>
  </View>
);

const getNames = (arr?: { name?: string }[]) => {
  if (!Array.isArray(arr)) return "N/A";
  return (
    arr
      .filter((item): item is { name: string } => !!item?.name)
      .map((item) => item.name)
      .join(", ") || "N/A"
  );
};

const getYtbEmbedUrl = (url: string) => {
  const match = url.match(/(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1]
    ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&showinfo=0&autohide=1&controls=1`
    : null;
};

const MovieDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useGlobalContext();

  const [movie, setMovie] = useState<InteractionMovie | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [videoSources, setVideoSources] = useState<Episode[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [ready, setReady] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    const fetchMovieStats = async () => {
      if (movie?.slug) {
        const [avg, likes] = await Promise.all([
          getAverageRating(movie.slug),
          getTotalLikes(movie.slug),
        ]);

        setAverageRating(avg);
        setTotalLikes(likes);
      }
    };

    fetchMovieStats();
  }, [movie, rating, totalLikes]);

  const posterUrl = useMemo(() => {
    const url = movie?.poster_url || "";
    return url.startsWith("http") ? url : `https://phimimg.com/${url}`;
  }, [movie?.poster_url]);

  const embedUrl = useMemo(
    () => getYtbEmbedUrl(movie?.trailer_url || ""),
    [movie?.trailer_url]
  );

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const storedMovie = await AsyncStorage.getItem(id);
        if (storedMovie) {
          setMovie(JSON.parse(storedMovie));
          setLoadingMovie(false);
        } else {
          const movieData = await fetchMovieDetails(id);
          setMovie(movieData);
          await AsyncStorage.setItem(id, JSON.stringify(movieData));
          setLoadingMovie(false);
        }
      } catch (error) {
        console.error(
          "Failed to load movie details from AsyncStorage or API:",
          error
        );
        setLoadingMovie(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Load video sources
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videoData = await fetchMovieVideos(id);
        setVideoSources(videoData);
        setLoadingVideos(false);
      } catch (error) {
        console.error("Failed to load video sources:", error);
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [id]);

  const episodes = useMemo(
    () =>
      Array.isArray(videoSources)
        ? videoSources.filter((ep) => ep.link_m3u8?.trim())
        : [],
    [videoSources]
  );

  const firstAvailableEpisode = useMemo(
    () => episodes.find((ep) => ep.link_m3u8?.trim()),
    [episodes]
  );

  useEffect(() => {
    if (!loadingMovie && !loadingVideos) {
      const timer = setTimeout(() => setReady(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loadingMovie, loadingVideos]);

  const checkInteractions = useCallback(async () => {
    if (user && movie?.slug) {
      try {
        const [favorite, like, commented, rating] = await Promise.all([
          checkIfFavorite(movie.slug, user.$id),
          checkIfLike(movie.slug, user.$id),
          checkIfComment(movie.slug, user.$id),
          checkIfRating(movie.slug, user.$id),
        ]);
        setIsFavorite(favorite);
        setIsLike(like);
        const fetchedComments = await getCommentsForMovie(movie.slug);
        setComments(fetchedComments);
        if (rating !== null) setRating(rating);
      } catch (error) {
        console.error("❌ Failed to check interactions:", error);
      }
    }
  }, [user, movie]);

  useEffect(() => {
    checkInteractions();
  }, [checkInteractions]);

  const toggleFavorite = useCallback(async () => {
    if (!user || !movie) return;
    try {
      if (isFavorite) {
        await unsaveFavorite(movie.slug, user.$id);
        Toast.show({ type: "success", text1: "Removed from favorites" });
      } else {
        await saveToInteractions(movie);
        Toast.show({ type: "success", text1: "Added to favorites" });
      }
      setIsFavorite((prev) => !prev);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update favorites.",
      });
    }
  }, [isFavorite, user, movie]);

  const toggleLike = useCallback(async () => {
    if (!user || !movie) return;
    try {
      if (isLike) {
        await unsaveLike(movie.slug, user.$id);
        Toast.show({ type: "success", text1: "Like is removed" });
      } else {
        await saveToInteractions(movie);
        Toast.show({ type: "success", text1: "Like this movie" });
      }
      setIsLike((prev) => !prev);
      const updatedLikes = await getTotalLikes(movie.slug);
      setTotalLikes(updatedLikes);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update likes.",
      });
    }
  }, [isLike, user, movie]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!movie) {
      console.error("❌ Movie not found");
      return;
    }

    try {
      await submitComment(movie.slug, newComment);
      const updatedComments = await getCommentsForMovie(movie.slug);
      setComments(updatedComments);
      setNewComment("");
    } catch (error) {
      console.error("❌ Không thể gửi bình luận:", error);
    }
  };

  const handleRating = async (value: number) => {
    if (!movie) {
      console.error("❌ Movie or User is not available");
      return;
    }

    try {
      await submitRating(movie.slug, value);
      setRating(value);
      console.log("✅ Đánh giá đã được gửi");
    } catch (error) {
      console.error("❌ Không thể gửi đánh giá:", error);
    }
  };

  if (!ready) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View className="bg-black flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="relative">
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-[450px]"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={!user || !movie}
            className="absolute bottom-2 left-5 w-16 h-16 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm shadow-lg z-10 items-center justify-center active:scale-95"
          >
            <Image
              source={isFavorite ? icons.save : icons.unsave}
              className="w-8 h-8"
              tintColor="#fff"
            />
          </TouchableOpacity>

          {firstAvailableEpisode && (
            <TouchableOpacity
              className="absolute bottom-2 right-5 w-16 h-16 bg-white/20 border-2 border-white rounded-full z-10 items-center justify-center shadow-lg active:scale-95"
              onPress={() => {
                router.push({
                  pathname: "/movies/component/Player",
                  params: {
                    link: firstAvailableEpisode.link_m3u8,
                    title: `${movie?.name || ""} - ${
                      firstAvailableEpisode.name
                    }`,
                    episodes: JSON.stringify(
                      episodes.map((e) => ({ name: e.name, link: e.link_m3u8 }))
                    ),
                  },
                });
              }}
            >
              <Image
                source={icons.play}
                className="w-10 h-10"
                tintColor="#fff"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Movie Info */}
        <View className="px-5 mt-5">
          <View className="flex-row justify-between items-center ">
            <Text
              className="text-white text-xl font-bold flex-1"
              numberOfLines={1}
            >
              {movie?.name || "Unknown Title"}
            </Text>

            <TouchableOpacity
              onPress={toggleLike}
              disabled={!user || !movie}
              className="w-12 h-12  backdrop-blur-sm shadow-lg items-center justify-center active:scale-95 ml-4"
            >
              <Image
                source={icons.like}
                className="w-8 h-8"
                tintColor={isLike ? "#E50914" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-x-3 mt-2">
            <Text className="text-white">{movie?.year}</Text>
            <Text className="text-white">{movie?.time}</Text>
            <Text className="text-white">{movie?.quality}</Text>
  
               <View className="flex-row items-center">
               <Text className="text-yellow mr-1">{averageRating ?? 0}</Text>
               <Image source={icons.star} className="h-5 w-5" tintColor={"#FACC15"}/>
             </View>
              <View className="flex-row items-center">
                <Text className="text-green mr-1">{totalLikes?? 0}</Text>
                <Image source={icons.like} className="h-5 w-5" tintColor={"#34D399"}/>
              </View>
          </View>
          {/* Rating */}
          <View className="flex-row items-center mt-4">
            <Text className="text-white mr-2">Rating:</Text>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                <Text
                  className={`text-xl mx-1 ${
                    rating && rating >= star ? "text-yellow" : "text-white"
                  }`}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <MovieInfo label="Overview" value={movie?.content} isFullRow />
          <MovieInfo label="Original Title" value={movie?.origin_name} />
          <MovieInfo label="Genres" value={getNames(movie?.category)} />
          <MovieInfo label="Country" value={getNames(movie?.country)} />
          <MovieInfo label="Language" value={movie?.lang} />
          <MovieInfo label="Status" value={movie?.status} />
          <MovieInfo
            label="Episodes"
            value={
              movie?.episode_current && movie?.episode_total
                ? `${movie.episode_current}/${movie.episode_total}`
                : movie?.episode_current || movie?.episode_total || "N/A"
            }
          />
        </View>

        {/* Trailer  */}
        {embedUrl && (
          <View className="mt-5 px-5">
            <Text className="text-white text-lg font-bold mb-2">Trailer</Text>
            <View className="aspect-video w-full overflow-hidden rounded-lg">
              <WebView
                source={{ uri: embedUrl }}
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
              />
            </View>
          </View>
        )}

        {/* Episodes */}
        {episodes.length > 0 && (
          <View className="mt-5 px-5">
            <Text className="text-white text-lg font-bold mb-4 px-2">
              Choose Episodes
            </Text>
            <View className="flex flex-row flex-wrap gap-y-4 gap-x-4 px-2">
              {episodes.map((ep, idx) => (
                <View key={idx} className="w-[30%] items-center">
                  <TouchableOpacity
                    className="bg-background-dark px-5 py-3 rounded-lg w-full items-center"
                    onPress={() =>
                      router.push({
                        pathname: "/movies/component/Player",
                        params: {
                          link: ep.link_m3u8,
                          title: `${movie?.name || "Unknown Title"} - ${
                            ep.name
                          }`,
                          episodes: JSON.stringify(
                            episodes.map((e) => ({
                              name: e.name,
                              link: e.link_m3u8,
                            }))
                          ),
                          index: String(idx),
                        },
                      })
                    }
                  >
                    <Text className="text-white text-lg font-bold">
                      {ep.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Comments Section */}
        <View className="px-5 mt-6">
          <Text className="text-white text-lg font-semibold mb-2">
            Comments
          </Text>

          {/* Hiển thị các bình luận */}
          {comments.map((cmt, index) => (
            <View key={index} className="mb-3 bg-neutral-800 p-3 rounded-xl">
              <Text className="text-white font-semibold">{cmt.name}</Text>
              <Text className="text-neutral-300">{cmt.comment}</Text>
            </View>
          ))}

          {/* Ô nhập bình luận */}
          <View className="flex-row items-center mt-2 w-full justify-between">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Enter comment..."
              placeholderTextColor="#999"
              className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-xl mr-4"
            />
            <TouchableOpacity onPress={handleSubmitComment}>
              <Image
                source={icons.send}
                className="w-8 h-8"
                tintColor="#E50914"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Go Back Button */}
      <TouchableOpacity
        className="absolute bottom-10 mt-2 left-0 right-0 mx-5 bg-primary-600 rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-2 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
