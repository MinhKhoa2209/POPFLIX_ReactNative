import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalContext } from "@/app/(auth)/AuthContext";
import { account } from "@/services/appwrite";
import { icons } from "@/constants/icons";
import { Entypo } from "@expo/vector-icons";
import { login } from "@/services/auth";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

const LoginScreen = () => {
  const router = useRouter();
  const { loading, refetch } = useGlobalContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadRememberedData = async () => {
      const savedEmail = await AsyncStorage.getItem("rememberedEmail");
      const savedPassword = await AsyncStorage.getItem("rememberedPassword");

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };
    loadRememberedData();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter both email and password",
      });
      return;
    }
    try {
      const session = await account.createEmailPasswordSession(email, password);
      if (session) {
        if (rememberMe) {
          await AsyncStorage.setItem("rememberedEmail", email);
          await AsyncStorage.setItem("rememberedPassword", password);
        } else {
          await AsyncStorage.removeItem("rememberedEmail");
          await AsyncStorage.removeItem("rememberedPassword");
        }
        await refetch();
      }
    } catch (error) {
      console.error("Login failed:", error);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Please try again.",
      });
    }
  };

  const handleGoogleLogin = async () => {
    const loginSuccess = await login();
    if (loginSuccess) {
      await refetch();
    } else {
      Toast.show({
        type: "error",
        text1: "Google login failed",
        text2: "Something went wrong during Google login.",
      });
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-4 bg-background-dark">
      <Text className="text-5xl font-bold text-primary-600 mb-10">POPFLIX</Text>
      <View className="bg-black w-full max-w-md p-6 rounded-2xl shadow-lg border border-white/40">
        <Text className="text-white text-2xl font-bold mb-6 border-b-2 border-[#F03D3E] pb-1 self-start">
          Login
        </Text>
        <Text className="text-white mb-1">Email</Text>
        <TextInput
          className="border border-dark-200 bg-background-dark p-3 rounded text-white mb-4 h-14"
          placeholder="name@example.com"
          placeholderTextColor="gray"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="text-white mb-1">Password</Text>
        <View className="flex-row items-center border border-dark-200 bg-background-dark px-3 rounded mb-4 h-14">
          <TextInput
            className="flex-1 text-white"
            placeholder="Enter your password"
            placeholderTextColor="gray"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Entypo
              name={isPasswordVisible ? "eye": "eye-with-line"  }
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {/* Remember me & Forgot */}
        <View className="flex-row justify-between items-center mb-5">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setRememberMe(!rememberMe)}>
            <View className="w-5 h-5 border border-gray-400 rounded-sm items-center justify-center bg-white">
              {rememberMe && <Entypo name="check" size={16} color="red" />}
            </View>
            <Text className="text-white ml-2">Remember me</Text>
          </TouchableOpacity>
       
        </View>

        {/* Login button */}
        <TouchableOpacity
          className="bg-primary-600 py-4 rounded mb-5"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-bold">LOGIN</Text>
          )}
        </TouchableOpacity>

        {/* Google Login */}
        <TouchableOpacity
          className="flex-row items-center justify-center border border-gray-500 py-4 rounded bg-background-dark mb-4"
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0000ff" />
          ) : (
            <>
              <Image source={icons.google} className="w-6 h-6 mr-2" />
              <Text className="text-white">Login with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sign Up */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-white">Don't you have an account yet? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/SignUpScreen")}>
            <Text className="text-red-500 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
