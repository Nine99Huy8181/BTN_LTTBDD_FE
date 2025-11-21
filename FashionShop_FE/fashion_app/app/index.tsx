// app/index.tsx
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Routes } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://res.cloudinary.com/dkokkltme/image/upload/v1763744948/messi_cvs6lc.avif' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.fashionStore}>Fashion Store</Text>
              <Text style={styles.changeStyle}>Change your</Text>
              <Text style={styles.changeStyle}>style</Text>
            </View>

            {/* Discover Button */}
            <TouchableOpacity
              style={styles.discoverButton}
              onPress={() => router.push(Routes.AuthLogin)}
              activeOpacity={0.8}
            >
              <Text style={styles.discoverText}>Discover</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 80,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginTop: 40,
  },
  fashionStore: {
    fontFamily: 'serif',
    fontSize: 42,
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: 30,
    letterSpacing: 1,
  },
  changeStyle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 56,
  },
  discoverButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  discoverText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 8,
  },
});