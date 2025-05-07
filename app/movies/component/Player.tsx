import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ControlPlayer from "./ControlPlayer";

let controlTimeout: NodeJS.Timeout;

const Player = () => {
  const videoRef = useRef<null | React.ComponentRef<typeof Video>>(null);
  const { link, title, episodes, index } = useLocalSearchParams<{
    title: string;
    episodes: string;
    index: string;
    link: string;
  }>();

  const parsedEpisodes = episodes ? JSON.parse(episodes) : [];
  const defaultIndex = index ? Number(index) : 0;
  const isSingleLink = !episodes && link;

  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const currentEpisode = isSingleLink
    ? { name: title || "Episode", link: link || "" }
    : parsedEpisodes[currentIndex];

  useEffect(() => {
    if (!currentEpisode?.link) {
      Alert.alert("Error", "Video link is invalid or missing.");
    }
  }, [currentEpisode]);

  useEffect(() => {
    const adjustLayoutForOrientation = async () => {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    };
    adjustLayoutForOrientation();
  }, [isFullscreen]);

  useEffect(() => {
    return () => clearTimeout(controlTimeout); 
  }, []);

  const seekForward = () => videoRef.current?.seek(currentTime + 15);
  const seekBackward = () => videoRef.current?.seek(Math.max(currentTime - 15, 0));

  const toggleFullscreen = async () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleEpisodeChange = (idx: number) => setCurrentIndex(idx);
  const handleToggleControls = () => {
    if (showControls) {
      setShowControls(false);
      if (controlTimeout) {
        clearTimeout(controlTimeout); 
      }
    } else {
      setShowControls(true);
      if (controlTimeout) {
        clearTimeout(controlTimeout);
      }
      controlTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Video Area */}
      <View className="w-full bg-black" 
      style={{ aspectRatio: isFullscreen ? undefined : 16/9, height: isFullscreen ? '100%' : undefined }}>
        <Pressable onPress={handleToggleControls} className="flex-1">
          <Video
            ref={videoRef}
            source={{ uri: currentEpisode?.link || "" }}
            style={{ width: "100%", height: "100%" }}
            paused={paused}
            rate={playbackRate}
            resizeMode="contain"
            onProgress={({ currentTime }) => setCurrentTime(currentTime)}
            onLoad={({ duration }) => setDuration(duration)}
          />

          {showControls && (
            <ControlPlayer
              onPause={() => setPaused((v) => !v)}
              onRewind={seekBackward}
              onForward={seekForward}
              onToggleSpeed={(speed) => setPlaybackRate(speed)}
              onToggleFullscreen={toggleFullscreen}
              paused={paused}
              currentSpeed={playbackRate}
              onSliderChange={(v) => videoRef.current?.seek(v)}
              currentTime={currentTime}
              duration={duration}
              isFullscreen={isFullscreen}
            />
          )}
        </Pressable>
      </View>

      {/* Scroll Area */}
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={router.back} className="mr-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold flex-shrink">
            {`${title?.split(" - ")[0] || "Now Playing"} - ${currentEpisode?.name || ""}`}
          </Text>
        </View>

        {/* Navigation Buttons */}
        {!isSingleLink && parsedEpisodes.length > 0 && (
          <View className="flex-row justify-center mt-3 px-6">
            <TouchableOpacity
              disabled={currentIndex <= 0}
              onPress={() => handleEpisodeChange(currentIndex - 1)}
              className="items-center rounded-lg h-12 px-4 mx-2 w-40 justify-center bg-background-dark"
            >
              <Text className="text-white text-sm font-semibold">◀ Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentIndex >= parsedEpisodes.length - 1}
              onPress={() => handleEpisodeChange(currentIndex + 1)}
              className="items-center rounded-lg h-12 px-4 mx-2 w-40 justify-center bg-background-dark"
            >
              <Text className="text-white text-sm font-semibold">Next ▶</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Episode List */}
        {!isSingleLink && parsedEpisodes.length > 0 && (
          <View className="mt-6 px-4">
            <Text className="text-white text-lg font-bold mb-3">Choose Episode:</Text>
            <View className="flex flex-row flex-wrap gap-y-4 gap-x-4">
              {parsedEpisodes.map((ep: { name: string; link: string }, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleEpisodeChange(idx)}
                  className={`w-[30%] items-center px-5 py-3 rounded-lg ${
                    idx === currentIndex ? "bg-red-700" : "bg-background-dark"
                  }`}
                >
                  <Text className="text-white text-base font-semibold">{ep.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Player;
