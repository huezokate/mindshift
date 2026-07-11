import { Redirect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/** Dev-only component workbench. Release bundles drop the UI with the dead branch. */
export default function StorybookRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const StorybookUI = require('../../.rnstorybook').default;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StorybookUI />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
