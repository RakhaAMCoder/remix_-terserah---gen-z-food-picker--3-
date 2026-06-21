import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.terserah.foodpicker',
  appName: 'Terserah App',
  webDir: 'dist',

  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1A9E5C',
      sound: 'beep.wav'
    },

    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '939384428783-q6j35mkniie5l6r4gramdk60g1sgutqt.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;