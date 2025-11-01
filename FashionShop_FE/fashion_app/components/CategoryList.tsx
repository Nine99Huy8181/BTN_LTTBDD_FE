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
            {showAll ? 'Thu gọn' : 'See All'}
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
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
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
    fontFamily: 'serif',
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
  },
  toggleText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  flatList: {
    paddingHorizontal: 16,
    gap: 0,
  },
  categoryItem: {
    marginRight: 8,
  },
  categoryContent: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: 0,
  },
});