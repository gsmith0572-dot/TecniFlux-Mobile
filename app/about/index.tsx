import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { Image } from 'expo-image';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#cbd5e1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acerca de TecniFlux</Text>
      </View>

      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/tecniflux-logo.png')}
              style={{ width: 120, height: 120 }}
              contentFit="contain"
            />
          </View>

          {/* Versión */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionTitle}>TecniFlux v1.0.0</Text>
            <Text style={styles.versionSubtitle}>
              Más de 30,000 diagramas técnicos automotrices
            </Text>
          </View>

          {/* Desarrollado por */}
          <View style={styles.developerCard}>
            <Text style={styles.developerLabel}>Desarrollado por</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://klickifyagency.com')}
              style={styles.developerLink}
              activeOpacity={0.8}
            >
              <Text style={styles.developerName}>Klickify Agency ™</Text>
              <ExternalLink size={18} color="#06b6d4" />
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View style={styles.copyrightContainer}>
            <Text style={styles.copyrightText}>
              © 2025 Klickify Agency. Todos los derechos reservados.
            </Text>
          </View>

          {/* Links Legales */}
          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => router.push('/terms')}
              style={styles.linkButton}
              activeOpacity={0.8}
            >
              <Text style={styles.linkButtonText}>
                Términos de Servicio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/privacy')}
              style={styles.linkButton}
              activeOpacity={0.8}
            >
              <Text style={styles.linkButtonText}>
                Política de Privacidad
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  versionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  versionSubtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    textAlign: 'center',
  },
  developerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  developerLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  developerLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  developerName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  copyrightContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  copyrightText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  linksContainer: {
    gap: 12,
  },
  linkButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  linkButtonText: {
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '600',
  },
});
