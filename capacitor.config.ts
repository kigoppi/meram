import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fishmush.app',
  appName: 'Fishmush',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;