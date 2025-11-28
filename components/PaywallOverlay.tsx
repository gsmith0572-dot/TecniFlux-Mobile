import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X, Lock, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PlanType } from '../types/subscription';
import { getResetDate } from '../utils/searchCounter';

interface PaywallOverlayProps {
  visible: boolean;
  plan?: PlanType;
  message?: string;
  onClose?: () => void;
}

export default function PaywallOverlay({ visible, plan = 'free', message, onClose }: PaywallOverlayProps) {
  const router = useRouter();

  const getMessage = () => {
    if (message) return message;
    
    switch (plan) {
      case 'free':
        return 'Has alcanzado el límite de 3 búsquedas mensuales';
      case 'plus':
        return 'Has alcanzado el límite de 30 búsquedas mensuales';
      default:
        return 'Necesitas una suscripción activa para acceder a esta función';
    }
  };

  const getLimitText = () => {
    switch (plan) {
      case 'free':
        return '3 búsquedas/mes';
      case 'plus':
        return '30 búsquedas/mes';
      default:
        return null;
    }
  };

  const [resetDate, setResetDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (visible) {
      getResetDate().then(setResetDate);
    }
  }, [visible]);

  const formatResetDate = () => {
    if (!resetDate) return null;
    return resetDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => router.push('/pricing')}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700">
          <View className="items-center mb-6">
            <View className="bg-red-500/20 p-4 rounded-full mb-4">
              <Lock size={48} color="#ef4444" />
            </View>
            <Text className="text-white text-2xl font-bold mb-2 text-center">
              Límite Alcanzado
            </Text>
            <Text className="text-slate-400 text-center mb-2">
              {getMessage()}
            </Text>
            {getLimitText() && (
              <Text className="text-amber-400 text-sm font-semibold text-center mb-4">
                Límite actual: {getLimitText()}
              </Text>
            )}
            {resetDate && (
              <View className="flex-row items-center bg-slate-700/50 px-4 py-2 rounded-lg">
                <Calendar size={16} color="#06b6d4" />
                <Text className="text-slate-300 text-sm ml-2">
                  Tu contador se reinicia el {formatResetDate()}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/pricing')}
            className="bg-cyan-500 py-4 rounded-xl mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-lg">
              Ver Planes Disponibles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (onClose) {
                onClose();
              } else {
                router.back();
              }
            }}
            className="py-3"
            activeOpacity={0.8}
          >
            <Text className="text-slate-400 text-center">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

