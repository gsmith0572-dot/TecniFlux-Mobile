import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HelpCircle, MessageCircle, ArrowLeft, Phone, Mail } from 'lucide-react-native';
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
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#cbd5e1" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">¿Necesitas ayuda?</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Sección FAQ */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center mb-4">
            <HelpCircle size={24} color="#06b6d4" />
            <Text className="text-white text-lg font-bold ml-2">Preguntas Frecuentes</Text>
          </View>

          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              onPress={() => toggleFAQ(faq.id)}
              className="bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700"
              activeOpacity={0.8}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-200 font-semibold flex-1 pr-2">
                  {faq.question}
                </Text>
                <Text className="text-cyan-400 text-xl">
                  {expandedFAQ === faq.id ? '−' : '+'}
                </Text>
              </View>
              {expandedFAQ === faq.id && (
                <Text className="text-slate-300 mt-3 text-sm leading-5">
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección Contacto */}
        <View className="px-6 mt-8 mb-8">
          <View className="flex-row items-center mb-4">
            <MessageCircle size={24} color="#06b6d4" />
            <Text className="text-white text-lg font-bold ml-2">Contacto</Text>
          </View>

          {/* Botón WhatsApp */}
          <TouchableOpacity
            onPress={handleWhatsApp}
            className="bg-green-500 rounded-xl p-4 mb-3 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Phone size={24} color="#0f172a" />
            <Text className="text-slate-900 font-bold text-lg ml-3">
              Contactar por WhatsApp
            </Text>
          </TouchableOpacity>

          {/* Botón Email */}
          <TouchableOpacity
            onPress={handleEmail}
            className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Mail size={24} color="#cbd5e1" />
            <Text className="text-slate-300 font-semibold text-base ml-3">
              Enviar Email
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

