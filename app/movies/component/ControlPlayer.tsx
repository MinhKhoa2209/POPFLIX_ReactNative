import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

type ControlPlayerProps = {
  onPause: () => void;
  onRewind: () => void;
  onForward: () => void;
  onToggleSpeed: (speed: number) => void;
  onToggleFullscreen: () => void;
  paused: boolean;
  currentSpeed: number;
  onSliderChange: (value: number) => void;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

const ControlPlayer = ({
  onPause,
  onRewind,
  onForward,
  onToggleSpeed,
  onSliderChange,
  paused,
  currentTime,
  duration,
  isFullscreen,
  onToggleFullscreen,
}: ControlPlayerProps) => {
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);

  const handleSpeedSelect = (speed: number) => {
    onToggleSpeed(speed);
    setShowSpeedOptions(false);
  };

  return (
    <View className="absolute inset-0 justify-center items-center z-10">
      {/* Main Controls */}
      <View className="flex-row items-center justify-center">
        <TouchableOpacity onPress={onRewind} className="mx-2">
          <Ionicons name="play-back-outline" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPause} className="mx-4">
          <Ionicons
            name={paused ? "play-circle-outline" : "pause-circle-outline"}
            size={55}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onForward} className="mx-2">
          <Ionicons name="play-forward-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Speed + Fullscreen */}
      <View className="absolute bottom-4 left-2 right-2 flex-row justify-between px-6">
        <TouchableOpacity onPress={() => setShowSpeedOptions(true)}>
          <MaterialIcons name="speed" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleFullscreen}>
          <Ionicons
            name={isFullscreen ? "contract-outline" : "expand-outline"}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Slider + Time */}
      <View className="absolute bottom-8 left-2 right-2 mb-4">
        <View className="flex-row justify-between px-5">
          <Text className="text-white text-xs">{formatTime(currentTime)}</Text>
          <Text className="text-white text-xs">{formatTime(duration)}</Text>
        </View>
        <Slider
          style={{ width: "100%" }}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          onValueChange={onSliderChange}
          thumbTintColor="white"
          minimumTrackTintColor="white"
          maximumTrackTintColor="gray"
        />
      </View>

      {/* Speed Modal */}
      <Modal visible={showSpeedOptions} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setShowSpeedOptions(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ backgroundColor: "white", borderRadius: 8, padding: 20 }}>
            {[0.5, 1.0, 1.5, 2.0].map((speed) => (
              <TouchableOpacity
                key={speed}
                onPress={() => handleSpeedSelect(speed)}
                style={{ marginVertical: 10 }}
              >
                <Text style={{ fontSize: 18, color: "black", textAlign: "center" }}>
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ControlPlayer;
