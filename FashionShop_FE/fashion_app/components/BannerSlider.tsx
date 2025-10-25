import { View, Image, StyleSheet, Dimensions } from 'react-native';
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
            <View style={styles.overlay} />
          </View>
        ))}
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  swiper: {
    height: 240,
  },
  slide: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  pagination: {
    bottom: 16,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
