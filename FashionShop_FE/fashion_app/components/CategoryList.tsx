import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Category } from '@/types';
import { Routes } from '@/constants';

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const displayedCategories = showAll ? categories : categories.slice(0, 6);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        router.push(`${Routes.CustomerSearch}?categoryId=${item.categoryID}`)
      }
      activeOpacity={0.7}
    >
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Danh mục</Text>
          <View style={styles.titleUnderline} />
        </View>
        <TouchableOpacity 
          onPress={() => setShowAll(!showAll)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {showAll ? 'Thu gọn' : 'Xem tất cả'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayedCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.categoryID.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F5F5F5',
  },
  toggleText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  flatList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    marginRight: 12,
  },
  categoryContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});