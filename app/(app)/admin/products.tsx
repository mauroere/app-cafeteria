import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Plus, CreditCard as Edit2, Trash2 } from 'lucide-react-native';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category_id: string;
};

type Category = {
  id: string;
  name: string;
};

export default function ProductManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [menuResponse, categoriesResponse] = await Promise.all([
        supabase.from('menu_items').select('*').order('name'),
        supabase.from('categories').select('id, name').order('name')
      ]);

      if (menuResponse.error) throw menuResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setMenuItems(menuResponse.data);
      setCategories(categoriesResponse.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load data');
      setLoading(false);
    }
  }

  async function toggleItemAvailability(item: MenuItem) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);

      if (error) throw error;

      setMenuItems(menuItems.map(menuItem => 
        menuItem.id === item.id 
          ? { ...menuItem, is_available: !menuItem.is_available }
          : menuItem
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update item availability');
    }
  }

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Text style={styles.headerTitle}>Product Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image
              source={{ uri: item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
              style={styles.itemImage}
            />
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              <Text style={[styles.itemStatus, item.is_available ? styles.statusAvailable : styles.statusUnavailable]}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {/* Handle edit */}}
              >
                <Edit2 size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {/* Handle delete */}}
              >
                <Trash2 size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#FF4B2B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  itemContainer: {
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
  itemImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4B2B',
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusAvailable: {
    color: '#34C759',
  },
  statusUnavailable: {
    color: '#FF3B30',
  },
  actionButtons: {
    padding: 8,
    justifyContent: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
});