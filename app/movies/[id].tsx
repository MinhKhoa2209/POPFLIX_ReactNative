import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Image, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails, fetchMovieVideos } from "@/services/api";
import { icons } from "@/constants/icons";
import { Episode, Movie } from "@/interfaces/interfaces";
import {
  checkIfFavorite,
  saveToFavorites,
  unsaveFavorite,
} from "@/services/appwrite";
import { useGlobalContext } from "@/app/(auth)/AuthContext";
import Toast from "react-native-toast-message";

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
  const videoIdMatch = url.match(
    /(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/
  );
  const videoId = videoIdMatch?.[1];
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&autohide=1&controls=1`;
};

const MovieDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useGlobalContext();

  const { data: movie } = useFetch<Movie>(() => fetchMovieDetails(id));
  const { data: videoSources } = useFetch<Episode[]>(() =>
    fetchMovieVideos(id)
  );

  const episodes = Array.isArray(videoSources)
    ? videoSources.filter(
        (episode) => episode.link_m3u8 && episode.link_m3u8.trim() !== ""
      )
    : [];



  const firstAvailableEpisode = episodes.find(
    (ep) => ep.link_m3u8 && ep.link_m3u8.trim() !== ""
  );


  const [isFavorite, setIsFavorite] = useState(false);

  const posterUrl = movie?.poster_url?.startsWith("http")
    ? movie.poster_url
    : `https://phimimg.com/${movie?.poster_url}`;
  const embedUrl = getYtbEmbedUrl(movie?.trailer_url || "");

  useEffect(() => {
    const checkFavorite = async () => {
      if (user && movie?.slug) {
        const exists = await checkIfFavorite(movie.slug, user.$id);
        setIsFavorite(exists);
      }
    };
    checkFavorite();
  }, [user, movie]);

  const toggleFavorite = async () => {
    if (!user || !movie) return;
    try {
      if (isFavorite) {
        await unsaveFavorite(movie.slug, user.$id);
        Toast.show({
          type: "success",
          text1: "Removed from favorites",
        });
      } else {
        await saveToFavorites(movie);
        Toast.show({
          type: "success",
          text1: "Added to favorites",
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while saving to favorites.",
      });
    }
  };

  return (
    <View className="bg-black flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="relative">
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-[550px]"
            resizeMode="stretch"
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
                  pathname: "/movies/watch",
                  params: {
                    link: firstAvailableEpisode.link_m3u8,
                    title: `${movie?.name || ""} - ${
                      firstAvailableEpisode.name
                    }`,
                    episodes: JSON.stringify(
                      episodes.map((e) => ({
                        name: e.name,
                        link: e.link_m3u8,
                      }))
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
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-xl font-bold">
              {movie?.name || "Unknown Title"}
            </Text>
          </View>

          <View className="flex-row gap-x-3 mt-2">
            <Text className="text-white">{movie?.year}</Text>
            <Text className="text-white">{movie?.time}</Text>
            <Text className="text-white">{movie?.quality}</Text>
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

        {episodes.length > 0 && (
          <View className="mt-5 px-5">
            <Text className="text-white text-lg font-bold mb-4">
              Watch Episodes
            </Text>
            <View className="flex flex-wrap flex-row justify-between gap-y-4">
              {episodes.map((ep, idx) => (
                <View key={idx} className="w-[30%] items-center">
                  <TouchableOpacity
                    className="bg-background-dark px-5 py-3 rounded-lg w-full items-center"
                    onPress={() =>
                      router.push({
                        pathname: "/movies/watch",
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
      </ScrollView>
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
