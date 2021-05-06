import { InjectionToken } from "@angular/core";

export let APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  webApplicationId: string;
}

export interface AppConfig {
  appName: string;
  apiBase: string;
  googleApiKey: string;
  oneSignalAppId: string;
  oneSignalGPSenderId: string;
  availableLanguages: Array<any>;
  firebaseConfig: FirebaseConfig;
  enableBranding: boolean;
  enableBuyThisApp: boolean;
}

export const BaseAppConfig: AppConfig = {
  appName: "Seto",
  // apiBase: "https://admin.seto.app/",
  apiBase: "http://192.168.1.26:8000/",

  googleApiKey: "AIzaSyDWqolrYHxhQ5iDLpwPHkKeChgF6sJssnw",
  oneSignalAppId: "2d98f8cc-3223-44a9-86f9-e217590e4136",
  oneSignalGPSenderId: "413327940304",
  availableLanguages: [
    {
      code: "en",
      name: "English",
    },
    {
      code: "de",
      name: "German",
    },
  ],
  enableBranding: false,
  enableBuyThisApp: false,
  firebaseConfig: {
    webApplicationId:
      "413327940304-2bh08vgkbarpdrketq3116f2sqmnrnn6.apps.googleusercontent.com",
    apiKey: "AIzaSyDWqolrYHxhQ5iDLpwPHkKeChgF6sJssnw",
    authDomain: "seto-e596b.firebaseapp.com",
    databaseURL: "https://seto-e596b.firebaseio.com",
    projectId: "seto-e596b",
    storageBucket: "seto-e596b.appspot.com",
    messagingSenderId: "413327940304",
  },
};
