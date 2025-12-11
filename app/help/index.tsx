import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HelpCircle, MessageCircle, ArrowLeft, Phone, Mail } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useState } from 'react';

export default function HelpScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: '¿Cómo buscar diagramas?',
      answer: 'Ve a Búsqueda, selecciona marca y año del vehículo, y presiona Buscar. Verás todos los diagramas disponibles.'
    },
    {
      id: '2',
      question: '¿Cómo funcionan las suscripciones?',
      answer: 'Plan Free: 3 búsquedas/mes. Plan Plus: 30 búsquedas/mes ($5.99). Plan Premium: Ilimitadas ($9.99). Plan Pro: Ilimitadas + 3 usuarios ($19.99).'
    },
    {
      id: '3',
      question: '¿Cómo cancelar mi plan?',
      answer: 'Contacta a soporte y cancelaremos tu suscripción inmediatamente.'
    }
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/16013348430?text=Hola,%20necesito%20ayuda%20con%20TecniFlux');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@klickifyagency.com?subject=Soporte%20TecniFlux');
  };

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
        <Text style={styles.headerTitle}>¿Necesitas ayuda?</Text>
      </View>

      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        {/* Sección FAQ */}
        <View style={styles.faqSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/tecniflux-logo.png')}
              style={{ width: 150, height: 150, backgroundColor: 'transparent' }}
              contentFit="contain"
            />
          </View>

          <View style={styles.sectionHeader}>
            <HelpCircle size={24} color="#06b6d4" />
            <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
          </View>

          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              onPress={() => toggleFAQ(faq.id)}
              style={styles.faqCard}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>
                  {faq.question}
                </Text>
                <Text style={styles.faqToggle}>
                  {expandedFAQ === faq.id ? '−' : '+'}
                </Text>
              </View>
              {expandedFAQ === faq.id && (
                <Text style={styles.faqAnswer}>
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección Contacto */}
        <View style={styles.contactSection}>
          <View style={styles.sectionHeader}>
            <MessageCircle size={24} color="#06b6d4" />
            <Text style={styles.sectionTitle}>Contacto</Text>
          </View>

          {/* Botón WhatsApp */}
          <TouchableOpacity
            onPress={handleWhatsApp}
            style={styles.whatsappButton}
            activeOpacity={0.8}
          >
            <Phone size={24} color="#0f172a" />
            <Text style={styles.whatsappButtonText}>
              Contactar por WhatsApp
            </Text>
          </TouchableOpacity>

          {/* Botón Email */}
          <TouchableOpacity
            onPress={handleEmail}
            style={styles.emailButton}
            activeOpacity={0.8}
          >
            <Mail size={24} color="#cbd5e1" />
            <Text style={styles.emailButtonText}>
              Enviar Email
            </Text>
          </TouchableOpacity>
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
  faqSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  faqCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    color: '#cbd5e1',
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  faqToggle: {
    color: '#06b6d4',
    fontSize: 20,
  },
  faqAnswer: {
    color: '#cbd5e1',
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  contactSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  whatsappButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 12,
  },
  emailButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButtonText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 12,
  },
});
