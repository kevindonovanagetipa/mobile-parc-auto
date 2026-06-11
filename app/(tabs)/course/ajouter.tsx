import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Menu, Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';

import { COLORS } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { CoursePayload, MoyenLocomotion, courseService } from '@/services/courseService';

type CourseFormData = {
  date_course: string;
  heure_depart: string;
  heure_retour_prevue: string;
  objet_course: string;
  destination_itineraire: string;
  responsable: string;
  coursier: string;
  moyen_locomotion: MoyenLocomotion;
};

const today = new Date().toISOString().split('T')[0];

const MOYENS_LOCOMOTION: MoyenLocomotion[] = [
  'à pied',
  'moto',
  'bus',
  'voiture',
];

const normalizeHeure = (heure: string): string => {
  if (!heure) return heure;

  const parts = heure.split(':');

  if (parts.length === 2) {
    return `${heure}:00`;
  }

  return heure;
};

const buildPayload = (formData: CourseFormData): CoursePayload => ({
  date_course: formData.date_course.trim(),
  heure_depart: normalizeHeure(formData.heure_depart.trim()),
  heure_retour_prevue: formData.heure_retour_prevue.trim()
    ? normalizeHeure(formData.heure_retour_prevue.trim())
    : '',
  objet_course: formData.objet_course.trim(),
  destination_itineraire: formData.destination_itineraire.trim(),
  responsable: formData.responsable.trim(),
  coursier: formData.coursier.trim(),
  moyen_locomotion: formData.moyen_locomotion,
});

export default function AjouterCourse() {
  const [loading, setLoading] = useState(false);
  const [moyenMenuVisible, setMoyenMenuVisible] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    date_course: today,
    heure_depart: '',
    heure_retour_prevue: '',
    objet_course: '',
    destination_itineraire: '',
    responsable: '',
    coursier: '',
    moyen_locomotion: '',
  });

  const handleChange = (field: keyof CourseFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const checks: [string, boolean][] = [
      ['la date', !formData.date_course.trim()],
      ["l'heure de départ", !formData.heure_depart.trim()],
      ["l'objet de la course", !formData.objet_course.trim()],
      ["la destination ou l'itinéraire", !formData.destination_itineraire.trim()],
      ['le responsable', !formData.responsable.trim()],
      ['le coursier', !formData.coursier.trim()],
      ['le moyen de locomotion', !formData.moyen_locomotion],
    ];

    for (const [label, invalid] of checks) {
      if (invalid) {
        Alert.alert('Champ manquant', `Veuillez renseigner ${label}.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      await courseService.createCourse(buildPayload(formData));

      Alert.alert('Succès', 'Course ajoutée avec succès');
      router.replace(ROUTES.COURSES);
    } catch (error: any) {
      console.log('Erreur ajout course :', error);

      Alert.alert('Erreur', error.message || "Impossible d'ajouter la course.");
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
            Nouvelle course
          </Text>

          <Text variant="bodyMedium" style={styles.subtitle}>
            Remplissez les informations de la course
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Date *"
              mode="outlined"
              value={formData.date_course}
              onChangeText={(v) => handleChange('date_course', v)}
              style={styles.input}
              placeholder="Ex : 2026-05-20"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
              left={<TextInput.Icon icon="calendar" color={COLORS.primary} />}
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
                <TextInput.Icon icon="clock-outline" color={COLORS.primary} />
              }
            />

            <TextInput
              label="Heure prévue pour le retour"
              mode="outlined"
              value={formData.heure_retour_prevue}
              onChangeText={(v) => handleChange('heure_retour_prevue', v)}
              style={styles.input}
              placeholder="Ex : 12:00"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
              left={
                <TextInput.Icon icon="clock-check-outline" color={COLORS.primary} />
              }
            />

            <TextInput
              label="Objet de la course *"
              mode="outlined"
              value={formData.objet_course}
              onChangeText={(v) => handleChange('objet_course', v)}
              style={styles.input}
              placeholder="Ex : Dépôt de documents"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Destination / Itinéraire *"
              mode="outlined"
              value={formData.destination_itineraire}
              onChangeText={(v) => handleChange('destination_itineraire', v)}
              style={styles.input}
              placeholder="Ex : AGETIPA → Ministère"
              multiline
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Responsable *"
              mode="outlined"
              value={formData.responsable}
              onChangeText={(v) => handleChange('responsable', v)}
              style={styles.input}
              placeholder="Ex : Rakoto Jean"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Coursier *"
              mode="outlined"
              value={formData.coursier}
              onChangeText={(v) => handleChange('coursier', v)}
              style={styles.input}
              placeholder="Ex : Rabe Paul"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Moyen de locomotion *</Text>

              <Menu
                visible={moyenMenuVisible}
                onDismiss={() => setMoyenMenuVisible(false)}
                contentStyle={styles.menuContent}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMoyenMenuVisible(true)}
                    icon="map-marker-path"
                    textColor={COLORS.primaryDark}
                    style={styles.selectButton}
                    contentStyle={styles.selectButtonContent}
                  >
                    {formData.moyen_locomotion || 'Sélectionner un moyen'}
                  </Button>
                }
              >
                {MOYENS_LOCOMOTION.map((moyen) => (
                  <Menu.Item
                    key={moyen}
                    title={moyen}
                    titleStyle={
                      moyen === formData.moyen_locomotion
                        ? styles.menuItemSelected
                        : undefined
                    }
                    onPress={() => {
                      handleChange('moyen_locomotion', moyen);
                      setMoyenMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>
            </View>

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
                Ajouter la course
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
  selectContainer: {
    marginBottom: 14,
  },
  selectLabel: {
    marginBottom: 6,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  selectButton: {
    borderRadius: 8,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  selectButtonContent: {
    justifyContent: 'flex-start',
    minHeight: 52,
  },
  menuContent: {
    backgroundColor: COLORS.surface,
  },
  menuItemSelected: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
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
