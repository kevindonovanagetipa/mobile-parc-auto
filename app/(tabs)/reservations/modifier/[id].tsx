import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';
import { COLORS } from '@/constants/colors';
import {
  reservationService,
  UpdateReservationPayload,
} from '@/services/reservationService';

interface Vehicule {
  id: number;
  marque?: string;
  modele?: string;
  numero_vehicule?: string;
  numero_immatriculation?: string;
}

interface Chauffeur {
  id: number;
  nom?: string;
  prenom?: string;
}

type StatutReservation = 'en_attente' | 'validee' | 'terminee' | 'annulee';

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
  statut: StatutReservation;
};

const statutOptions: { label: string; value: StatutReservation }[] = [
  { label: 'En attente', value: 'en_attente' },
  { label: 'Validée', value: 'validee' },
  { label: 'Terminée', value: 'terminee' },
  { label: 'Annulée', value: 'annulee' },
];

const extractList = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;

  return [];
};

const fetchAllPages = async (url: string, headers: Record<string, string>) => {
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
      throw new Error(
        'Session expirée ou accès non autorisé. Veuillez vous reconnecter.'
      );
    }

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des données.');
    }

    const json = await response.json();
    const items = extractList(json);

    allItems = [...allItems, ...items];

    const total =
      json?.total ||
      json?.data?.total ||
      json?.count ||
      json?.data?.count ||
      json?.pagination?.total ||
      json?.data?.pagination?.total ||
      json?.meta?.total ||
      json?.data?.meta?.total;

    const totalPages =
      json?.totalPages ||
      json?.data?.totalPages ||
      json?.pagination?.totalPages ||
      json?.data?.pagination?.totalPages ||
      json?.meta?.totalPages ||
      json?.data?.meta?.totalPages;

    if (totalPages) {
      hasMore = page < Number(totalPages);
    } else if (total) {
      hasMore = allItems.length < Number(total);
    } else {
      hasMore = items.length === limit;
    }

    page += 1;
  }

  return allItems;
};

const getNomVoiture = (vehicule: Vehicule) => {
  const nomVoiture = [vehicule.marque, vehicule.modele]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    nomVoiture ||
    vehicule.numero_vehicule ||
    vehicule.numero_immatriculation ||
    `Véhicule ${vehicule.id}`
  );
};

const getNomChauffeur = (chauffeur: Chauffeur) => {
  const nomComplet = [chauffeur.prenom, chauffeur.nom]
    .filter(Boolean)
    .join(' ')
    .trim();

  return nomComplet || `Chauffeur ${chauffeur.id}`;
};

const formatDateInput = (value?: string) => {
  if (!value) return '';

  if (value.includes('T')) {
    return value.split('T')[0];
  }

  return value.slice(0, 10);
};

const formatTimeInput = (value?: string) => {
  if (!value) return '';

  if (value.includes('T')) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  }

  return value.slice(0, 5);
};

export default function ModifierReservation() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loadingPage, setLoadingPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);

  const [vehiculeMenuVisible, setVehiculeMenuVisible] = useState(false);
  const [chauffeurMenuVisible, setChauffeurMenuVisible] = useState(false);
  const [statutMenuVisible, setStatutMenuVisible] = useState(false);

  const [formData, setFormData] = useState<ReservationFormData>({
    objet_deplacement: '',
    date_depart: '',
    heure_depart: '',
    lieu_depart: '',
    destination_itineraire: '',
    date_retour: '',
    heure_retour: '',
    nombre_passager: '1',
    passagers: '',
    vehicule_id: '',
    utilisateur_id: '',
    chauffeur_id: '',
    statut: 'en_attente',
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);

      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          Alert.alert(
            'Erreur',
            'Token d’accès introuvable. Veuillez vous reconnecter.'
          );
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [vehiculesData, chauffeursData] = await Promise.all([
          fetchAllPages(`${API_BASE_URL}/api/vehicules`, headers),
          fetchAllPages(`${API_BASE_URL}/api/chauffeurs/disponibles`, headers),
        ]);

        setVehicules(vehiculesData);
        setChauffeurs(chauffeursData);
      } catch (error: any) {
        console.log('Erreur chargement options :', error);

        Alert.alert(
          'Erreur',
          error.message ||
            'Une erreur est survenue lors du chargement des véhicules et chauffeurs.'
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    const loadReservation = async () => {
      if (!id) {
        Alert.alert('Erreur', 'ID de réservation introuvable.');
        router.back();
        return;
      }

      setLoadingPage(true);

      try {
        const reservation = await reservationService.getReservationById(id);

        setFormData({
          objet_deplacement: reservation.objet_deplacement || '',
          date_depart: formatDateInput(reservation.date_depart),
          heure_depart: formatTimeInput(reservation.heure_depart),
          lieu_depart: reservation.lieu_depart || '',
          destination_itineraire: reservation.destination_itineraire || '',
          date_retour: formatDateInput(reservation.date_retour),
          heure_retour: formatTimeInput(reservation.heure_retour),
          nombre_passager: reservation.nombre_passager
            ? String(reservation.nombre_passager)
            : '1',
          passagers: reservation.passagers || '',
          vehicule_id: reservation.vehicule_id
            ? String(reservation.vehicule_id)
            : '',
          utilisateur_id: reservation.utilisateur_id
            ? String(reservation.utilisateur_id)
            : '',
          chauffeur_id: reservation.chauffeur_id
            ? String(reservation.chauffeur_id)
            : '',
          statut: reservation.statut || 'en_attente',
        });
      } catch (error: any) {
        console.log('Erreur chargement réservation :', error);

        Alert.alert(
          'Erreur',
          error.message || 'Impossible de charger la réservation.'
        );

        router.back();
      } finally {
        setLoadingPage(false);
      }
    };

    loadReservation();
  }, [id]);

  const handleChange = (field: keyof ReservationFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedVehicule = vehicules.find(
    (vehicule) => String(vehicule.id) === formData.vehicule_id
  );

  const selectedChauffeur = chauffeurs.find(
    (chauffeur) => String(chauffeur.id) === formData.chauffeur_id
  );

  const selectedStatut = statutOptions.find(
    (statut) => statut.value === formData.statut
  );

  const validateForm = () => {
    if (!formData.objet_deplacement.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir l’objet du déplacement.');
      return false;
    }

    if (!formData.date_depart.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la date de départ.');
      return false;
    }

    if (!formData.heure_depart.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir l’heure de départ.');
      return false;
    }

    if (!formData.lieu_depart.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le lieu de départ.');
      return false;
    }

    if (!formData.destination_itineraire.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la destination ou l’itinéraire.');
      return false;
    }

    if (!formData.date_retour.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la date de retour.');
      return false;
    }

    if (!formData.heure_retour.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir l’heure de retour.');
      return false;
    }

    if (!formData.nombre_passager || Number(formData.nombre_passager) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre de passagers valide.');
      return false;
    }

    if (!formData.passagers.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir les passagers.');
      return false;
    }

    if (!formData.vehicule_id.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner une voiture.');
      return false;
    }

    if (!formData.chauffeur_id.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner un chauffeur.');
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    if (!id) {
      Alert.alert('Erreur', 'ID de réservation introuvable.');
      return;
    }

    setLoading(true);

    try {
      const payload: UpdateReservationPayload = {
        objet_deplacement: formData.objet_deplacement,
        date_depart: formData.date_depart,
        heure_depart: formData.heure_depart,
        lieu_depart: formData.lieu_depart,
        destination_itineraire: formData.destination_itineraire,
        date_retour: formData.date_retour,
        heure_retour: formData.heure_retour,
        nombre_passager: Number(formData.nombre_passager),
        passagers: formData.passagers,
        vehicule_id: Number(formData.vehicule_id),
        utilisateur_id: formData.utilisateur_id
          ? Number(formData.utilisateur_id)
          : null,
        chauffeur_id: Number(formData.chauffeur_id),
        statut: formData.statut,
      };

      await reservationService.updateReservation(id, payload);

      Alert.alert('Succès', 'Réservation modifiée avec succès.');

      router.back();
    } catch (error: any) {
      console.log('Erreur modification réservation :', error);

      Alert.alert(
        'Erreur',
        error.message || 'Impossible de modifier la réservation.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de la réservation...</Text>
      </View>
    );
  }

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
            Modifier la réservation
          </Text>

          <Text variant="bodyMedium" style={styles.subtitle}>
            Mettez à jour les informations de la demande de véhicule
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Objet du déplacement *"
              mode="outlined"
              value={formData.objet_deplacement}
              onChangeText={(value) => handleChange('objet_deplacement', value)}
              style={styles.input}
              placeholder="Ex : Visite Alasora"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Date de départ *"
              mode="outlined"
              value={formData.date_depart}
              onChangeText={(value) => handleChange('date_depart', value)}
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
              onChangeText={(value) => handleChange('heure_depart', value)}
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
              onChangeText={(value) => handleChange('lieu_depart', value)}
              style={styles.input}
              placeholder="Ex : AGETIPA"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
            />

            <TextInput
              label="Destination / Itinéraire *"
              mode="outlined"
              value={formData.destination_itineraire}
              onChangeText={(value) =>
                handleChange('destination_itineraire', value)
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
              onChangeText={(value) => handleChange('date_retour', value)}
              style={styles.input}
              placeholder="Ex : 2026-05-20"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primaryDark}
              left={<TextInput.Icon icon="calendar" color={COLORS.primary} />}
            />

            <TextInput
              label="Heure de retour *"
              mode="outlined"
              value={formData.heure_retour}
              onChangeText={(value) => handleChange('heure_retour', value)}
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
              onChangeText={(value) => handleChange('nombre_passager', value)}
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
              onChangeText={(value) => handleChange('passagers', value)}
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
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : vehicules.length > 0 ? (
                  vehicules.map((vehicule) => (
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
                  ))
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
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : chauffeurs.length > 0 ? (
                  chauffeurs.map((chauffeur) => (
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
                  ))
                ) : (
                  <Menu.Item
                    title="Aucun chauffeur disponible"
                    onPress={() => setChauffeurMenuVisible(false)}
                  />
                )}
              </Menu>
            </View>

            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Statut *</Text>

              <Menu
                visible={statutMenuVisible}
                onDismiss={() => setStatutMenuVisible(false)}
                contentStyle={styles.menuContent}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setStatutMenuVisible(true)}
                    icon="check-circle-outline"
                    textColor={COLORS.primaryDark}
                    style={styles.selectButton}
                    contentStyle={styles.selectButtonContent}
                  >
                    {selectedStatut
                      ? selectedStatut.label
                      : 'Sélectionner un statut'}
                  </Button>
                }
              >
                {statutOptions.map((statut) => (
                  <Menu.Item
                    key={statut.value}
                    title={statut.label}
                    titleStyle={
                      statut.value === formData.statut
                        ? styles.menuItemSelected
                        : undefined
                    }
                    onPress={() => {
                      handleChange('statut', statut.value);
                      setStatutMenuVisible(false);
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
                onPress={handleUpdate}
                style={styles.submitButton}
                buttonColor={COLORS.primary}
                textColor={COLORS.surface}
                loading={loading}
                disabled={loading || loadingOptions}
              >
                Modifier
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
  loadingMenu: {
    padding: 16,
    alignItems: 'center',
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
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.primaryDark,
  },
});