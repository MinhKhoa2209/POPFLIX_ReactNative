import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Movie } from '@/interfaces/interfaces';
import HotMovieCard from './HotMovieCard';
import Carousel from 'react-native-reanimated-carousel';


const { width: screenWidth } = Dimensions.get("window");
const HotMovieCarousel = React.memo(({ data }: { data: Movie[] }) => {
    
    return (
      <Carousel
        loop
        width={screenWidth}
        height={450}
        autoPlay
        autoPlayInterval={2000}
        scrollAnimationDuration={500}
        data={data}
        mode="parallax"
        pagingEnabled
        renderItem={({ item }) => <HotMovieCard {...item} />}
      />
    );
  });
  

export default HotMovieCarousel

