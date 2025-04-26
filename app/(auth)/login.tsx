import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      router.replace(profile.role === 'admin' ? '/(app)/admin/' : '/(app)/customer/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg' }}
        style={styles.backgroundImage}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome to FoodieHub</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#666"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: Platform.OS === 'web' ? 50 : 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF4B2B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  link: {
    color: '#FF4B2B',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
});