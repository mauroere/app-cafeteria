import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email,
            full_name: fullName,
            role: 'customer', // Default role
          },
        ]);

      if (profileError) throw profileError;

      router.replace('/(app)/customer/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
        style={styles.backgroundImage}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join FoodieHub today</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#666"
        />

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
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign In</Text>
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