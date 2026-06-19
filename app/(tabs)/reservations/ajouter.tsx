import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { COLORS } from '@/constants/colors';
import { reservationService } from '@/services/reservationService';

type ReservationFormData = {
  objet_deplacement: string;
  date_depart: string;
  heure_depart: string;
  lieu_depart: string;
  destination_itineraire: string;
  date_retour: string;
  heure_retour: string;
  nombre_passager: string;
  passagers: string;
  utilisateur_id: string;
  statut: 'en_attente' | 'validee' | 'terminee' | 'annulee';
};

const today = new Date().toISOString().split('T')[0];

const normalizeHeure = (heure: string): string => {
  if (!heure) return heure;

  const parts = heure.split(':');

  if (parts.length === 2) {
    return `${heure}:00`;
  }

  return heure;
};

export default function AjouterReservation() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ReservationFormData>({
    objet_deplacement: '',
    date_depart: today,
    heure_depart: '',
    lieu_depart: '',
    destination_itineraire: '',
    date_retour: today,
    heure_retour: '',
    nombre_passager: '1',
    passagers: '',
    utilisateur_id: '',
    statut: 'en_attente',
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');

        if (!raw) return;

        const user = JSON.parse(raw);

        setFormData((prev) => ({
          ...prev,
          utilisateur_id: user?.id ? String(user.id) : '',
        }));
      } catch (error) {
        console.log('Erreur lecture utilisateur :', error);
      }
    };

    loadUser();
  }, []);

  const handleChange = (field: keyof ReservationFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const checks: [string, boolean][] = [
      ["l'objet du déplacement", !formData.objet_deplacement.trim()],
      ['la date de départ', !formData.date_depart.trim()],
      ["l'heure de départ", !formData.heure_depart.trim()],
      ['le lieu de départ', !formData.lieu_depart.trim()],
      [
        'la destination ou itinéraire',
        !formData.destination_itineraire.trim(),
      ],
      ['la date de retour', !formData.date_retour.trim()],
      ["l'heure de retour", !formData.heure_retour.trim()],
      ['les passagers', !formData.passagers.trim()],
    ];

    for (const [label, invalid] of checks) {
      if (invalid) {
        Alert.alert('Champ manquant', `Veuillez renseigner ${label}.`);
        return false;
      }
    }

    if (!formData.nombre_passager || Number(formData.nombre_passager) <= 0) {
      Alert.alert(
        'Erreur',
        'Veuillez saisir un nombre de passagers valide.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      await reservationService.createReservation({
        objet_deplacement: formData.objet_deplacement.trim(),
        date_depart: formData.date_depart,
        heure_depart: normalizeHeure(formData.heure_depart),
        lieu_depart: formData.lieu_depart.trim(),
        destination_itineraire: formData.destination_itineraire.trim(),
        date_retour: formData.date_retour,
        heure_retour: normalizeHeure(formData.heure_retour),
        nombre_passager: Number(formData.nombre_passager),
        passagers: formData.passagers.trim(),

        // Champs obligatoires côté backend, mais non sélectionnés côté mobile
        vehicule_id: null,
        chauffeur_id: null,

        utilisateur_id: formData.utilisateur_id
          ? Number(formData.utilisateur_id)
          : null,

        statut: formData.statut,
      });

      Alert.alert('Succès', 'Réservation ajoutée avec succès');
      router.replace(ROUTES.RESERVATIONS);
    } catch (error: any) {
      console.log('Erreur ajout réservation :', error);

      Alert.alert(
        'Erreur',
        error.message || "Impossible d'ajouter la réservation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Nouvelle réservation
          </Text>

          <Text variant="bodyMedium" style={styles.subtitle}>
            Remplissez les informations de la demande de véhicule
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Objet du déplacement *"
              mode="outlined"
              value={formData.objet_deplacement}
              onChangeText={(v) => handleChange('objet_deplacement', v)}
              style={styles.input}
              placeholder="Ex : Visite Alasora"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Date de départ *"
              mode="outlined"
              value={formData.date_depart}
              onChangeText={(v) => handleChange('date_depart', v)}
              style={styles.input}
              placeholder="Ex : 2026-05-20"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
              left={
                <TextInput.Icon
                  icon="calendar"
                  color={COLORS.primary}
                />
              }
            />

            <TextInput
              label="Heure de départ *"
              mode="outlined"
              value={formData.heure_depart}
              onChangeText={(v) => handleChange('heure_depart', v)}
              style={styles.input}
              placeholder="Ex : 08:00"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
              left={
                <TextInput.Icon
                  icon="clock-outline"
                  color={COLORS.primary}
                />
              }
            />

            <TextInput
              label="Lieu de départ *"
              mode="outlined"
              value={formData.lieu_depart}
              onChangeText={(v) => handleChange('lieu_depart', v)}
              style={styles.input}
              placeholder="Ex : AGETIPA"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Destination / Itinéraire *"
              mode="outlined"
              value={formData.destination_itineraire}
              onChangeText={(v) =>
                handleChange('destination_itineraire', v)
              }
              style={styles.input}
              placeholder="Ex : Alasora"
              multiline
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Date de retour *"
              mode="outlined"
              value={formData.date_retour}
              onChangeText={(v) => handleChange('date_retour', v)}
              style={styles.input}
              placeholder="Ex : 2026-05-20"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
              left={
                <TextInput.Icon
                  icon="calendar"
                  color={COLORS.primary}
                />
              }
            />

            <TextInput
              label="Heure de retour *"
              mode="outlined"
              value={formData.heure_retour}
              onChangeText={(v) => handleChange('heure_retour', v)}
              style={styles.input}
              placeholder="Ex : 12:00"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
              left={
                <TextInput.Icon
                  icon="clock-outline"
                  color={COLORS.primary}
                />
              }
            />

            <TextInput
              label="Nombre de passagers *"
              mode="outlined"
              value={formData.nombre_passager}
              onChangeText={(v) => handleChange('nombre_passager', v)}
              style={styles.input}
              placeholder="Ex : 2"
              keyboardType="numeric"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Les passagers *"
              mode="outlined"
              value={formData.passagers}
              onChangeText={(v) => handleChange('passagers', v)}
              style={styles.input}
              placeholder="Ex : Mahefa, Qeurcy"
              multiline
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.cancelButton}
                textColor={COLORS.primaryDark}
                disabled={loading}
              >
                Annuler
              </Button>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                buttonColor={COLORS.primary}
                textColor={COLORS.surface}
                loading={loading}
                disabled={loading}
              >
                Enregistrer
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },

  subtitle: {
    marginTop: 4,
    color: COLORS.primary,
    opacity: 0.8,
  },

  card: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    elevation: 4,
  },

  input: {
    marginBottom: 14,
    backgroundColor: COLORS.surface,
  },

  infoBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f1f8ff',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#d6eaff',
  },

  infoText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    lineHeight: 18,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },

  cancelButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: COLORS.primary,
  },

  submitButton: {
    flex: 1,
    borderRadius: 8,
  },
});