import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Menu, ShoppingCart } from 'lucide-react-native';

type Category = {
  id: string;
  name: string;
  description: string;
  image_url: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
};

export default function MenuScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data);
      if (data.length > 0) setSelectedCategory(data[0].id);
    } catch (error) {
      setError('Failed to load categories');
    }
  }

  async function fetchMenuItems() {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name');
      
      if (error) throw error;
      setMenuItems(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load menu items');
      setLoading(false);
    }
  }

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4B2B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Menu size={24} color="#1a1a1a" />
        <Text style={styles.headerTitle}>Our Menu</Text>
        <ShoppingCart size={24} color="#1a1a1a" />
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item.id && styles.categoryButtonTextActive
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.menuItem}>
            <Image
              source={{ uri: item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
              style={styles.menuItemImage}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  categoriesList: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  categoryButtonActive: {
    backgroundColor: '#FF4B2B',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  menuList: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  menuItemContent: {
    flex: 1,
    padding: 12,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4B2B',
  },
});