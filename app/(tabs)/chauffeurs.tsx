import { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, Text, Avatar, Chip, FAB } from 'react-native-paper';
import { chauffeurService, Chauffeur } from '@/services/chauffeurService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Helpers ---
const DISPO_CONFIG: Record<string, { couleur: string }> = {
  Disponible:   { couleur: '#4caf50' },
  disponible:   { couleur: '#4caf50' },
  'En course':  { couleur: '#ff9800' },
  en_course:    { couleur: '#ff9800' },
  Congé:        { couleur: '#9e9e9e' },
  conge:        { couleur: '#9e9e9e' },
  Indisponible: { couleur: '#f44336' },
};

function getCouleur(disponibilite: string) {
  return DISPO_CONFIG[disponibilite]?.couleur ?? '#9e9e9e';
}

function getInitiales(nom: string, prenom: string) {
  return `${nom?.[0] ?? ''}${prenom?.[0] ?? ''}`.toUpperCase();
}

// --- Composant carte ---
function ChauffeurCard({ c }: { c: Chauffeur }) {
  const couleur = getCouleur(c.disponibilite);
  const nomComplet = `${c.nom} ${c.prenom}`;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.row}>
        <Avatar.Text
          size={48}
          label={getInitiales(c.nom, c.prenom)}
          style={{ backgroundColor: couleur + '33' }}
          color={couleur}
        />
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.nom}>{nomComplet}</Text>
          {!!c.telephone && (
            <Text variant="bodySmall" style={styles.tel}>{c.telephone}</Text>
          )}
          {!!c.email && (
            <Text variant="bodySmall" style={styles.tel}>{c.email}</Text>
          )}
          <View style={styles.chips}>
            <Chip
              style={{ backgroundColor: couleur + '22', alignSelf: 'flex-start', marginTop: 4 }}
              textStyle={{ color: couleur, fontSize: 11 }}
            >
              {c.disponibilite}
            </Chip>
            {!!c.categorie_permis && (
              <Chip
                style={{ backgroundColor: '#6200ee22', alignSelf: 'flex-start', marginTop: 4 }}
                textStyle={{ color: '#6200ee', fontSize: 11 }}
              >
                Permis {c.categorie_permis}
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

// --- Page principale ---
export default function Chauffeurs() {
  const [chauffeurs, setChauffeurs]   = useState<Chauffeur[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchChauffeurs = useCallback(async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const data = await chauffeurService.getAll(currentPage);

      setChauffeurs(prev => {
        if (reset) return data.items;
        const existingIds = new Set(prev.map(c => c.id));
        return [...prev, ...data.items.filter(c => !existingIds.has(c.id))];
      });

      setHasMore(data.pagination.page * data.pagination.limit < data.pagination.total);
      if (!reset) setPage(p => p + 1);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [page]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchChauffeurs(true);
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchChauffeurs(true);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchChauffeurs();
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 40) {
            onEndReached();
          }
        }}
        scrollEventThrottle={400}
      >
        {chauffeurs.map((c) => (
          <ChauffeurCard key={c.id} c={c} />
        ))}

        {loadingMore && (
          <ActivityIndicator style={{ marginVertical: 16 }} color="#6200ee" />
        )}

        {!hasMore && chauffeurs.length > 0 && (
          <Text style={styles.endText}>— Fin de la liste —</Text>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  content:    { padding: 16, paddingBottom: 80 },
  card:       { marginBottom: 12 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 16 },
  info:       { flex: 1 },
  nom:        { fontWeight: 'bold' },
  tel:        { color: '#666', marginTop: 2 },
  chips:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText:  { color: '#f44336', textAlign: 'center', paddingHorizontal: 24 },
  endText:    { textAlign: 'center', color: '#aaa', marginVertical: 12 },
});