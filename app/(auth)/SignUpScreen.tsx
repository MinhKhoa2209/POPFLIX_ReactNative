import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity,  ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { account } from "@/services/appwrite";
import { Entypo } from '@expo/vector-icons';
import Toast from "react-native-toast-message";

const SignUpScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {  
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter both email and password",
      });
      return;
    }
  
    setLoading(true);
    try {
      const user = await account.create("unique()", email, password);
      console.log("User created:", user);
      router.replace("/(auth)/LoginScreen");
    } catch (error) {
      Toast.show({  
        type: "error",
        text1: "Error",
        text2: "An error occurred during sign up",
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View className="flex-1 justify-center px-6 bg-black">
      <Text className="text-center text-3xl font-bold text-white mb-6">Sign Up</Text>
      <View className="bg-black w-full max-w-md p-6 rounded-2xl shadow-lg border border-white/40">
      <Text className="text-white">Email</Text>
      <TextInput 
        className="border border-dark-200 bg-background-dark p-3 rounded text-white mb-4 h-14"
        placeholder="name@example.com"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text className="text-white">Password</Text>
        <View className="flex-row items-center border border-dark-200 bg-background-dark px-3 rounded mb-4 h-14">
        <TextInput
          className="flex-1 text-base text-white"
          placeholder="Enter your password"
          placeholderTextColor="gray"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Entypo name={isPasswordVisible ?  "eye-with-line" :"eye"  } size={22} color="gray" />
            </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-primary-600 p-4 rounded w-full mt-5 mb-4"
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">SIGNUP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/LoginScreen")}>
        <Text className="text-white text-center">
          Already have an account? <Text className="text-red-500 ">Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};

export default SignUpScreen;
