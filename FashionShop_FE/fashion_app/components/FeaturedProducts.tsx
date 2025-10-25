import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ProductResponse } from '@/types';
import ProductItem from './ProductItem';

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
            {showAll ? 'Thu gọn' : 'Xem tất cả'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayedProducts}
        renderItem={({ item }) => <ProductItem product={item} horizontal />}
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
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#000000',
    marginTop: 8,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  flatList: {
    padding: 16,
  },
});