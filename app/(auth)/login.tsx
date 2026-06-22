import { useEffect, useState } from 'react';
import { getValidToken } from '@/utils/authToken';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import { COLORS } from '@/constants/colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkExistingSession = async () => {
      const token = await getValidToken();
      if (mounted && token) {
        router.replace(ROUTES.TABS);
      }
    };

    checkExistingSession();
    return () => { mounted = false; };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      await authService.login(email, password);
      router.replace(ROUTES.TABS);
    } catch (error: any) {
      Alert.alert('Invalides mot de passe ou Email', error.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo AGETIPA en haut à droite */}
        <Image
          source={require('@/assets/images/logo_agetipa.jpg')}
          style={styles.logoAgetipa}
          resizeMode="contain"
        />

        {/* Logo + Nom de l'appli */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo_parc_auto.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text variant="headlineMedium" style={styles.appName}>
            Parc Auto
          </Text>
          <Text variant="bodySmall" style={styles.appSubtitle}>
            Gestion de flotte automobile
          </Text>
        </View>

        {/* Carte de connexion */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Connexion
            </Text>

            <TextInput
              label="Email"
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
              left={<TextInput.Icon icon="email-outline" color={COLORS.primary} />}
            />

            <TextInput
  label="Mot de passe"
  mode="outlined"
  secureTextEntry={!showPassword}
  style={styles.input}
  value={password}
  onChangeText={setPassword}
  outlineColor={COLORS.primary}
  activeOutlineColor={COLORS.primaryDark}
  left={<TextInput.Icon icon="lock-outline" color={COLORS.primary} />}
  right={
    <TextInput.Icon
      icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
      color={COLORS.primary}
      onPress={() => setShowPassword(!showPassword)}
    />
  }
/>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor={COLORS.primary}
              textColor={COLORS.surface}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60, // espace pour le logo AGETIPA absolu
  },
  logoAgetipa: {
    position: 'absolute',
    borderRadius: 20,
    top: 45,
    right: 20,
    width: 45,
    height: 45,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 5,
    borderRadius: 35,
  },
  appName: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },
  appSubtitle: {
    color: COLORS.primary,
    marginTop: 4,
    opacity: 0.8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});