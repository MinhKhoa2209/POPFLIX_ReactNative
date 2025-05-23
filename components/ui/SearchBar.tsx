import { View, Image, TextInput } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

interface Props {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
}


const SearchBar = ({placeholder,onPress,value, onChangeText}:Props) => {
  return (
    <View className="flex-row items-center bg-background-dark rounded-full px-5 py-4">
        <Image source={icons.search} className="size-5" resizeMode="contain" tintColor= "#E50914" />
        <TextInput onPress={onPress} placeholder={placeholder} value= {value} onChangeText= {onChangeText} placeholderTextColor= "#fff" 
        className="text-white ml-2 flex-1" />
    </View>
  )
}

export default SearchBar
