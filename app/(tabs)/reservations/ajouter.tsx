import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  Menu,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/constants/api';
import { ROUTES } from '@/constants/routes';
import { COLORS } from '@/constants/colors';
import { reservationService } from '@/services/reservationService';

type Vehicule = {
  id: number;
  marque?: string;
  modele?: string;
  numero_vehicule?: string;
  numero_immatriculation?: string;
};

type Chauffeur = {
  id: number;
  nom?: string;
  prenom?: string;
};

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
  vehicule_id: string;
  utilisateur_id: string;
  chauffeur_id: string;
  statut: 'en_attente' | 'validee' | 'terminee' | 'annulee';
};

const today = new Date().toISOString().split('T')[0];

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;

  return [];
};

const fetchAllPages = async (
  url: string,
  headers: Record<string, string>
): Promise<any[]> => {
  let allItems: any[] = [];
  let page = 1;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const separator = url.includes('?') ? '&' : '?';
    const requestUrl = `${url}${separator}page=${page}&limit=${limit}`;

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const json = await response.json();
    const items = extractList(json);

    allItems = [...allItems, ...items];

    const totalPages =
      json?.totalPages ??
      json?.data?.totalPages ??
      json?.pagination?.totalPages ??
      json?.data?.pagination?.totalPages ??
      json?.meta?.totalPages ??
      json?.data?.meta?.totalPages ??
      null;

    const total =
      json?.total ??
      json?.data?.total ??
      json?.count ??
      json?.data?.count ??
      json?.pagination?.total ??
      json?.data?.pagination?.total ??
      json?.meta?.total ??
      json?.data?.meta?.total ??
      null;

    if (totalPages !== null) {
      hasMore = page < Number(totalPages);
    } else if (total !== null) {
      hasMore = allItems.length < Number(total);
    } else {
      hasMore = items.length === limit;
    }

    page += 1;
  }

  return allItems;
};

const getNomVoiture = (vehicule: Vehicule): string => {
  const nom = [vehicule.marque, vehicule.modele]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    nom ||
    vehicule.numero_vehicule ||
    vehicule.numero_immatriculation ||
    `Véhicule ${vehicule.id}`
  );
};

const getNomChauffeur = (chauffeur: Chauffeur): string => {
  const nom = [chauffeur.prenom, chauffeur.nom]
    .filter(Boolean)
    .join(' ')
    .trim();

  return nom || `Chauffeur ${chauffeur.id}`;
};

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
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);

  const [vehiculeMenuVisible, setVehiculeMenuVisible] = useState(false);
  const [chauffeurMenuVisible, setChauffeurMenuVisible] = useState(false);

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
    vehicule_id: '',
    utilisateur_id: '',
    chauffeur_id: '',
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

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);

      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          Alert.alert(
            'Erreur',
            "Token d'accès introuvable. Veuillez vous reconnecter."
          );
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [vehiculesData, chauffeursData] = await Promise.all([
          fetchAllPages(`${API_BASE_URL}/api/vehicules`, headers),
          fetchAllPages(`${API_BASE_URL}/api/chauffeurs`, headers),
        ]);

        setVehicules(vehiculesData);
        setChauffeurs(chauffeursData);
      } catch (error: any) {
        console.log('Erreur chargement véhicules/chauffeurs :', error);

        Alert.alert(
          'Erreur',
          error.message ||
            'Impossible de charger les véhicules et les chauffeurs.'
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (field: keyof ReservationFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedVehicule = vehicules.find(
    (v) => String(v.id) === formData.vehicule_id
  );

  const selectedChauffeur = chauffeurs.find(
    (c) => String(c.id) === formData.chauffeur_id
  );

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
      ['une voiture', !formData.vehicule_id],
      ['un chauffeur', !formData.chauffeur_id],
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
        objet_deplacement: formData.objet_deplacement,
        date_depart: formData.date_depart,
        heure_depart: normalizeHeure(formData.heure_depart),
        lieu_depart: formData.lieu_depart,
        destination_itineraire: formData.destination_itineraire,
        date_retour: formData.date_retour,
        heure_retour: normalizeHeure(formData.heure_retour),
        nombre_passager: Number(formData.nombre_passager),
        passagers: formData.passagers,
        vehicule_id: Number(formData.vehicule_id),
        utilisateur_id: formData.utilisateur_id
          ? Number(formData.utilisateur_id)
          : null,
        chauffeur_id: Number(formData.chauffeur_id),
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

            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Voiture *</Text>

              <Menu
                visible={vehiculeMenuVisible}
                onDismiss={() => setVehiculeMenuVisible(false)}
                contentStyle={styles.menuContent}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setVehiculeMenuVisible(true)}
                    disabled={loadingOptions}
                    icon="car"
                    textColor={COLORS.primaryDark}
                    style={styles.selectButton}
                    contentStyle={styles.selectButtonContent}
                  >
                    {selectedVehicule
                      ? getNomVoiture(selectedVehicule)
                      : loadingOptions
                        ? 'Chargement...'
                        : 'Sélectionner une voiture'}
                  </Button>
                }
              >
                {loadingOptions ? (
                  <View style={styles.loadingMenu}>
                    <ActivityIndicator
                      size="small"
                      color={COLORS.primary}
                    />
                    <Text style={styles.loadingText}>Chargement...</Text>
                  </View>
                ) : vehicules.length > 0 ? (
                  <ScrollView
                    style={styles.menuScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    persistentScrollbar
                    keyboardShouldPersistTaps="handled"
                  >
                    {vehicules.map((vehicule) => (
                      <Menu.Item
                        key={vehicule.id}
                        title={getNomVoiture(vehicule)}
                        titleStyle={
                          String(vehicule.id) === formData.vehicule_id
                            ? styles.menuItemSelected
                            : undefined
                        }
                        onPress={() => {
                          handleChange('vehicule_id', String(vehicule.id));
                          setVehiculeMenuVisible(false);
                        }}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <Menu.Item
                    title="Aucune voiture disponible"
                    onPress={() => setVehiculeMenuVisible(false)}
                  />
                )}
              </Menu>
            </View>

            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Chauffeur *</Text>

              <Menu
                visible={chauffeurMenuVisible}
                onDismiss={() => setChauffeurMenuVisible(false)}
                contentStyle={styles.menuContent}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setChauffeurMenuVisible(true)}
                    disabled={loadingOptions}
                    icon="account-tie"
                    textColor={COLORS.primaryDark}
                    style={styles.selectButton}
                    contentStyle={styles.selectButtonContent}
                  >
                    {selectedChauffeur
                      ? getNomChauffeur(selectedChauffeur)
                      : loadingOptions
                        ? 'Chargement...'
                        : 'Sélectionner un chauffeur'}
                  </Button>
                }
              >
                {loadingOptions ? (
                  <View style={styles.loadingMenu}>
                    <ActivityIndicator
                      size="small"
                      color={COLORS.primary}
                    />
                    <Text style={styles.loadingText}>Chargement...</Text>
                  </View>
                ) : chauffeurs.length > 0 ? (
                  <ScrollView
                    style={styles.menuScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    persistentScrollbar
                    keyboardShouldPersistTaps="handled"
                  >
                    {chauffeurs.map((chauffeur) => (
                      <Menu.Item
                        key={chauffeur.id}
                        title={getNomChauffeur(chauffeur)}
                        titleStyle={
                          String(chauffeur.id) === formData.chauffeur_id
                            ? styles.menuItemSelected
                            : undefined
                        }
                        onPress={() => {
                          handleChange('chauffeur_id', String(chauffeur.id));
                          setChauffeurMenuVisible(false);
                        }}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <Menu.Item
                    title="Aucun chauffeur disponible"
                    onPress={() => setChauffeurMenuVisible(false)}
                  />
                )}
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
                disabled={loading || loadingOptions}
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
  menuScroll: {
    maxHeight: 250,
  },
  menuItemSelected: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  loadingMenu: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: 13,
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