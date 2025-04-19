import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Dimensions } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Video from "react-native-video";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const Watch = () => {
  const { link, title, episodes, index } = useLocalSearchParams<{
    title: string;
    episodes: string;
    index: string;
    link: string;
  }>();

  const parsedEpisodes = episodes
    ? (JSON.parse(episodes) as { name: string; link: string }[])
    : [];

  const defaultIndex = index ? Number(index) : 0;
  const isSingleLink = !episodes && !!link;

  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const playerRef = useRef<null | React.ComponentRef<typeof Video>>(null);

  const currentEpisode = isSingleLink
    ? { name: title || "Episode", link: link || "" }
    : parsedEpisodes[currentIndex];

  useEffect(() => {
    if (!currentEpisode?.link) {
      Alert.alert("Error", "Video link is invalid or missing.");
    }

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, [currentEpisode]);

  const handleEpisodeChange = (idx: number) => {
    setCurrentIndex(idx);
    playerRef.current?.seek(0);
  };

  const handleVideoEnd = () => {
    const nextIndex = currentIndex + 1;
    if (!isSingleLink && nextIndex < parsedEpisodes.length) {
      setCurrentIndex(nextIndex);
    }
  };

  const enterFullscreen = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  };

  const exitFullscreen = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="w-full aspect-video bg-neutral-900">
        {currentEpisode?.link ? (
          <Video
            ref={playerRef}
            source={{ uri: currentEpisode.link }}
            style={{ width: "100%", height: "100%" }}
            controls
            resizeMode="contain"
            onEnd={handleVideoEnd}
            onFullscreenPlayerWillPresent={enterFullscreen}
            onFullscreenPlayerWillDismiss={exitFullscreen}
          />
        ) : (
          <Text className="text-white text-center mt-20 text-lg">
            Cannot play video.
          </Text>
        )}
      </View>

      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={router.back} className="mr-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-base font-bold flex-shrink">
          {`${title?.split(" - ")[0] || "Now Playing"} - ${
            currentEpisode?.name || ""
          }`}
        </Text>
      </View>

      {!isSingleLink && parsedEpisodes.length > 1 && (
        <View className="flex-row justify-center mt-3 px-6">
          <TouchableOpacity
            disabled={currentIndex <= 0}
            onPress={() => handleEpisodeChange(currentIndex - 1)}
            className={`items-center rounded-lg h-12 px-4 mx-2 w-40 justify-center ${
              currentIndex <= 0 ? "bg-gray-600" : "bg-background-dark"
            }`}
          >
            <Text className="text-white text-sm font-semibold">◀ Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={currentIndex >= parsedEpisodes.length - 1}
            onPress={() => handleEpisodeChange(currentIndex + 1)}
            className={`items-center rounded-lg h-12 px-4 mx-2 w-40 justify-center ${
              currentIndex >= parsedEpisodes.length - 1
                ? "bg-gray-600"
                : "bg-background-dark"
            }`}
          >
            <Text className="text-white text-sm font-semibold">Next ▶</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isSingleLink && parsedEpisodes.length > 0 && (
        <View className="mt-6 px-4">
          <Text className="text-white text-lg font-bold mb-3">
            Choose Episode:
          </Text>
          <View className="flex-row flex-wrap justify-between ">
            {parsedEpisodes.map((ep, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleEpisodeChange(idx)}
                className={` mb-3 px-5 py-3 rounded-lg items-center w-[30%] ${
                  idx === currentIndex ? "bg-red-700" : "bg-background-dark"
                }`}
              >
                <Text className="text-white text-base font-semibold">
                  {ep.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Watch;
