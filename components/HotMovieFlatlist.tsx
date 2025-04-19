import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Movie } from '@/interfaces/interfaces';
import HotMovieCard from './HotMovieCard';

const { width: screenWidth } = Dimensions.get('window');

const HotMovieFlatlist = React.memo(({ data }: { data: Movie[] }) => {
  const flatListRef = useRef<FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loopedData = [...data, ...data]; 

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth); 
    const actualIndex = index % data.length;
    setCurrentIndex(actualIndex);
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={loopedData}
        horizontal
        pagingEnabled
        keyExtractor={(item, index) => `${item.slug}_${index}`}
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        decelerationRate="fast"
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16} 
        renderItem={({ item }) => (
          <View style={{ width: screenWidth }}>
            <HotMovieCard {...item} />
          </View>
        )}
      />
      {/* Dot indicators */}
      <View className="flex-row justify-center mt-2">
        {data.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full mx-1 transition-all duration-200 ${
              currentIndex === index ? 'bg-primary-600 scale-110' : 'bg-gray-400 scale-100'
            }`}
          />
        ))}
      </View>
    </View>
  );
});

export default HotMovieFlatlist;
