import type { CapacitorConfig } from '@capacitor/cli';

const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.gokalp.marketpulse',
  appName: 'Market Pulse',
  webDir: 'dist',
  server: isProduction
    ? undefined
    : {
        url: 'http://localhost:5173',
        cleartext: true,
      },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#050507',
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#050507',
      showSpinner: false,
    },
  },
};

export default config;
