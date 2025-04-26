import React, { useCallback, useState, useRef } from 'react';
import { FlatList, View, ViewToken, Dimensions } from 'react-native';
import { Movie } from '@/interfaces/interfaces';
import HotMovieCard from '../cards/HotMovieCard';

const { width: screenWidth } = Dimensions.get('window');

// Tối ưu DotIndicator bằng React.memo
const DotIndicator = React.memo(({ count, active }: { count: number; active: number }) => (
  <View className="flex-row justify-center mt-2">
    {Array.from({ length: count }).map((_, index) => (
      <View
        key={index}
        className={`w-2 h-2 rounded-full mx-1 transition-all duration-200 ${
          active === index ? 'bg-primary-600 scale-110' : 'bg-gray-400 scale-100'
        }`}
      />
    ))}
  </View>
));

const HotMovieFlatlist = React.memo(({ data }: { data: Movie[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index ?? 0;
      // Cập nhật chỉ khi index thay đổi
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  }, [currentIndex]);

  const renderItem = useCallback(
    ({ item }: { item: Movie }) => (
      <View style={{ width: screenWidth }}>
        <HotMovieCard {...item} />
      </View>
    ),
    []
  );

  return (
    <View>
      <FlatList
        data={data}
        horizontal
        pagingEnabled
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.slug}_${index}`}
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        decelerationRate="fast"
        snapToAlignment="start"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={3} // Tăng số lượng render item ban đầu
        maxToRenderPerBatch={4} // Tăng số lượng render item per batch
        windowSize={7} // Tăng số window size để tối ưu hóa hiệu suất
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        removeClippedSubviews={true} // Bật removeClippedSubviews để tiết kiệm bộ nhớ
        disableVirtualization={false}
        // Thêm một số tối ưu thêm cho FlatList
        extraData={currentIndex}
      />

      {/* Dot indicators */}
      <DotIndicator count={data.length} active={currentIndex} />
    </View>
  );
});

export default HotMovieFlatlist;
