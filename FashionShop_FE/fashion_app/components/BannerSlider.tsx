import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

const banners = [
  'https://res.cloudinary.com/dkokkltme/image/upload/v1760195925/slider_1_btuwkl.jpg',
  'https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_2_f5bqdo.png',
  'https://res.cloudinary.com/dkokkltme/image/upload/v1760260953/img_product_lookbook_mtobq7.webp',
];

export default function BannerSlider() {
  return (
    <View style={styles.container}>
      <Swiper
        style={styles.swiper}
        autoplay
        autoplayTimeout={4}
        showsPagination
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={styles.pagination}
      >
        {banners.map((banner, index) => (
          <View key={index} style={styles.slide}>
            <Image 
              source={{ uri: banner }} 
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  swiper: {
    height: 200,
  },
  slide: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  pagination: {
    bottom: 12,
  },
  dot: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: 20,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});