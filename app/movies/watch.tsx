import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Video from "react-native-video";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaView } from "react-native-safe-area-context";

const Watch = () => {
  const { title, episodes, index } = useLocalSearchParams<{
    title: string;
    episodes: string;
    index: string;
  }>();

  const parsedEpisodes = JSON.parse(episodes || "[]");
  const [currentIndex, setCurrentIndex] = useState(Number(index || 0));
  const playerRef = useRef<null | React.ComponentRef<typeof Video>>(null);
  const currentEpisode = parsedEpisodes[currentIndex];

  const handleEpisodeChange = (idx: number) => {
    setCurrentIndex(idx);
    playerRef.current?.seek(0);
  };

  const handleVideoEnd = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < parsedEpisodes.length) {
      setCurrentIndex(nextIndex);
    }
  };

  const enterFullscreen = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  };

  const exitFullscreen = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Video Player */}
      <View className="w-full h-64 bg-black">
        {currentEpisode?.link && (
          <Video
            key={currentEpisode?.link}
            ref={playerRef}
            source={{ uri: currentEpisode.link, type: 'm3u8' }}
            className="w-full h-full"
            controls={true}
            resizeMode="contain"
            onEnd={handleVideoEnd}
            onFullscreenPlayerWillPresent={enterFullscreen}
            onFullscreenPlayerWillDismiss={exitFullscreen}
            onError={(e) => console.error("Video error", e)}
            fullscreen={false}
            paused={false}
            ignoreSilentSwitch="ignore"
          />
        )}
      </View>

      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={router.back} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">{title || "Now Playing"}</Text>
      </View>

      {/* Prev / Next buttons */}
      {parsedEpisodes.length > 1 && (
        <View className="flex-row justify-between px-6 mt-3">
          <TouchableOpacity
            disabled={currentIndex <= 0}
            onPress={() => handleEpisodeChange(currentIndex - 1)}
            className={`py-2 px-4 rounded-lg ${currentIndex <= 0 ? "bg-gray-700" : "bg-gray-600"}`}
          >
            <Text className="text-white">◀ Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={currentIndex >= parsedEpisodes.length - 1}
            onPress={() => handleEpisodeChange(currentIndex + 1)}
            className={`py-2 px-4 rounded-lg ${currentIndex >= parsedEpisodes.length - 1 ? "bg-gray-700" : "bg-gray-600"}`}
          >
            <Text className="text-white">Next ▶</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Episode selector */}
      {parsedEpisodes.length > 0 && (
        <View className="mt-5 px-4">
          <Text className="text-white text-xl font-bold mb-2">Choose Episode:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {parsedEpisodes.map((ep: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleEpisodeChange(idx)}
                className={`py-2 px-4 mr-3 rounded-full ${idx === currentIndex ? "bg-pink-600" : "bg-gray-600"}`}
              >
                <Text className="text-white text-sm">{ep.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Watch;
