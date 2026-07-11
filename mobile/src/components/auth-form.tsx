import { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Shared chrome for the Phase-0 auth screens (themed rebuild lands in T-030-04). */
export function AuthForm({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.form}
      >
        <Text style={styles.title}>{title}</Text>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#5b6570"
      autoCapitalize="none"
      style={styles.input}
      {...props}
    />
  );
}

export function AuthButton({
  label,
  onPress,
  secondary,
  disabled,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        (pressed || disabled) && styles.buttonDim,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a12' },
  form: { flex: 1, padding: 24, gap: 12, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#e8f6f8', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#1d4b56',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#e8f6f8',
    backgroundColor: '#101822',
  },
  button: {
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#5ad4e6',
  },
  buttonSecondary: {
    backgroundColor: '#101822',
    borderWidth: 1,
    borderColor: '#1d4b56',
  },
  buttonDim: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#0a0a12' },
  buttonTextSecondary: { color: '#5ad4e6' },
  error: { color: '#ff5c8a', fontSize: 14 },
});
