import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useGlobalContext } from "@/app/(auth)/AuthContext";
import { icons } from "@/constants/icons";
import { logout } from "@/services/auth";
import { account, uploadAvatar } from "@/services/appwrite";
import { format } from "date-fns";
import { images } from "@/constants/images";
import Toast from "react-native-toast-message";

const Profile = () => {
  const { user, setUser, refetch } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar);
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Camera roll permission is required to change avatar.",
        });
      }
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            const result = await logout();
            setIsLoading(false);
  
            if (result) {
              refetch();
              Toast.show({
                type: "success",
                text1: "Logged out successfully!",
                visibilityTime: 1500,
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Logout Failed",
                text2: "Unable to log out. Please try again.",
              });
            }
          },
        },
      ]
    );
  };

  const handleEditAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setIsLoading(true);
      try {
        const uploadedUrl = await uploadAvatar(uri);
        if (!user?.$id) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "User ID not found.",
          });
          return;
        }
        setAvatar(uploadedUrl);
        Toast.show({
          type: "success",
          text1: "Avatar updated successfully!",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to upload avatar.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdate = async () => {
    if (!newPhone && !newPassword && !newUsername) {
      Toast.show({
        type: "error",
        text1: "No changes made",
        text2: "Please enter a new phone number, password, or username.",
      });
      return;
    }
    if (newPhone && !newPhone.startsWith("+84")) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2: "Please enter a valid phone number.",
      });
      return;
    }
    if (newPhone && !currentPassword) {
      Toast.show({
        type: "error",
        text1: "Current Password Required",
        text2: "Please enter your current password to update phone number.",
      });
      return;
    }
    setIsLoading(true);
    try {
      if (newPhone) {
        await account.updatePhone(newPhone, currentPassword);
      }
      if (newPassword) {
        await account.updatePassword(newPassword);
      }
      if (newUsername) {
        await account.updateName(newUsername);
      }
      Toast.show({
        type: "success",
        text1: "Information updated successfully!",
        visibilityTime: 1500,
      });
      const updatedUser = await account.get();
      setUser(updatedUser);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "An error occurred while updating your information.",
        visibilityTime: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
       <View className="flex-row items-center justify-between mt-10 mb-5 px-5">
          <Text className="text-primary-600 text-3xl font-bold">POPFLIX</Text>
        </View>
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%"}}
      >
      
        <View className="items-center">
          <View className="relative mt-10">
            <Image
              source={{ uri: avatar }}
              className="w-44 h-44 rounded-full border-2 border-white"
            />
            <TouchableOpacity
              onPress={handleEditAvatar}
              className="absolute bottom-3 right-3 bg-white p-2 rounded-full border border-white shadow-md"
            >
              <Image source={icons.edit} className="w-6 h-6" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-rubik-bold mt-5 text-white text-center">
            {user?.name}
          </Text>
        </View>

        <View className="mt-12">
          <Text className="text-xl text-white font-rubik-bold mb-4 text-left">
            Personal Details
          </Text>

          <View className="bg-background-dark rounded-2xl p-6">
            <DetailItem label="Email" value={user?.email || "N/A"} />
            <DetailItem label="Phone" value={user?.phone || "N/A"} />
            <DetailItem label="User ID" value={user?.$id || "N/A"} />
            <DetailItem
              label="Account Created"
              value={
                user?.createdAt
                  ? format(new Date(user.createdAt), "MMM dd, yyyy HH:mm")
                  : "N/A"
              }
            />
            <DetailItem label="Role" value={user?.role || "User"} />
          </View>
        </View>
        <View className="mt-12">
          <Text className="text-xl text-white font-rubik-bold mb-4 text-left">
            Change User Information
          </Text>
          <View className="bg-background-dark rounded-2xl p-6">
            <TextInput
              placeholder="New Username"
              value={newUsername}
              onChangeText={setNewUsername}
              className="bg-white rounded-xl p-3 mb-4 h-12"
            />

            <TextInput
              placeholder="New Phone Number"
              value={newPhone}
              onChangeText={(text) => {
                if (text === "") {
                  setNewPhone("");
                  return;
                }
                const cleaned = text.replace(/[^0-9]/g, "");
                if (cleaned.startsWith("84")) {
                  setNewPhone("+" + cleaned);
                } else {
                  const formatted = cleaned.replace(/^0+/, "");
                  setNewPhone("+84" + formatted);
                }
              }}
              keyboardType="phone-pad"
              className="bg-white rounded-xl p-3 mb-4 h-12"
              maxLength={15}
            />

            <TextInput
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              className="bg-white rounded-xl p-3 mb-4 h-12"
            />

            <TextInput
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              className="bg-white rounded-xl p-3 mb-4 h-12"
            />
            <TouchableOpacity
              onPress={handleUpdate}
              className="bg-primary-600 rounded-xl py-3 flex-row justify-center items-center shadow-md"
            >
              <Text className="text-white font-bold text-lg">Update</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mt-16">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-primary-600 rounded-xl py-4 flex-row justify-center items-center shadow-md mb-28"
          >
            <Text className="text-white font-bold text-lg">Logout</Text>
            <Image source={icons.logout} className="w-6 h-6 ml-3" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View className="border-b border-white/10 pb-3 mb-3">
    <Text className="text-white/50 text-sm mb-1">{label}</Text>
    <Text className="text-white text-lg font-medium">{value}</Text>
  </View>
);

export default Profile;
