import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ProductResponse } from '@/types';
import ProductItem from './ProductItem';
import FeaturedProductItem from './FeaturedProductItem';

interface FeaturedProductsProps {
  products: ProductResponse[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sản phẩm nổi bật</Text>
          <View style={styles.titleUnderline} />
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={styles.toggleText}>
            {showAll ? 'Thu gọn' : 'See All'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayedProducts}
        renderItem={({ item }) => <FeaturedProductItem product={item} />}
        keyExtractor={(item) => item.productID.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0,
    fontFamily:'serif',
  },
  titleUnderline: {
    width: 32,
    height: 2,
    backgroundColor: '#000000',
    marginTop: 4,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  toggleText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  flatList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});