import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Component, Inject } from '@angular/core';
import { Platform, AlertController, MenuController } from '@ionic/angular';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import { APP_CONFIG, AppConfig } from './app.config';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { ClientService } from './services/client.service';
import { Constants } from './models/constants.models';
import { MyNotification } from './models/notification.models';
import { User } from './models/user.models';
import { CommonUiElement } from './services/app.commonelements';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import firebase from 'firebase';
import * as moment from 'moment';
import { RouterWrapperService } from 'src/app/services/router-wrapper.service';
import { Events } from 'src/app/services/event-handler.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  userMe: User;
  private rtlSide: string = "left";

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private platform: Platform,
    private oneSignal: OneSignal, private alertCtrl: AlertController, private events: Events,
    private translate: TranslateService, private statusBar: StatusBar, private splashScreen: SplashScreen,
    private clientService: ClientService, private cue: CommonUiElement, private menu: MenuController, private navCtrl: RouterWrapperService,
    public inAppBrowser: InAppBrowser) {
    
    this.initializeApp();
    this.refreshSettings();
    events.subscribe('language:selection', (language) => {
      this.globalize(language);
      window.location.reload();
    });
    events.subscribe("event:user", (res) => {
      if (res) {
        if (!res.ratings) res.ratings = 0;
        res.ratings = Number(res.ratings.toFixed(1));
      }
      console.log("user_event", res);
      this.userMe = res;
      if (this.platform.is('cordova') && this.userMe) this.updatePlayerId();
    });
  }

  getSuitableLanguage(language) {
    window.localStorage.setItem("locale", language);
    language = language.substring(0, 2).toLowerCase();
    console.log('check for: ' + language);
    return this.config.availableLanguages.some(x => x.code == language) ? language : 'en';
  }

  refreshSettings() {
    this.clientService.getSettings().subscribe(res => {
      console.log('setting_setup_success', res);
      window.localStorage.setItem(Constants.KEY_SETTING, JSON.stringify(res));
    }, err => {
      console.log('setting_setup_error', err);
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.show();
      firebase.initializeApp({
        apiKey: this.config.firebaseConfig.apiKey,
        authDomain: this.config.firebaseConfig.authDomain,
        databaseURL: this.config.firebaseConfig.databaseURL,
        projectId: this.config.firebaseConfig.projectId,
        storageBucket: this.config.firebaseConfig.storageBucket,
        messagingSenderId: this.config.firebaseConfig.messagingSenderId
      });

      this.userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
      if (this.userMe) {
        if (!this.userMe.ratings) this.userMe.ratings = 0;
        this.userMe.ratings = Number(this.userMe.ratings.toFixed(1));
      }
      if (this.platform.is('cordova')) this.initOneSignal();

      setTimeout(() => {
        this.splashScreen.hide();
        this.navCtrl.push(this.userMe ? "search" : "signin");
        if (this.platform.is('cordova') && this.userMe) this.updatePlayerId();
        this.clientService.logActivity(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => console.log('logActivity', res), err => console.log('logActivity', err));
      }, 3000);

      let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
      this.globalize(defaultLang);

      // this.platform.registerBackButtonAction(() => {
      //   if (this.menu.isOpen()) {
      //     this.menu.close();
      //   } else {
      //     const overlayView = this.ionicApp._overlayPortal._views[0];
      //     if (overlayView && overlayView.dismiss) {
      //       overlayView.dismiss();// it will close the modals, alerts
      //     } else if (this.nav.canGoBack()) {
      //       this.nav.pop();
      //     } else if (this.nav.getActive()&& this.nav.getActive().instance instanceof SearchPage) {
      //       this.platform.exitApp();
      //     } else {
      //       this.home();
      //     }
      //   }
      // }, 1);
    });
  }

  globalize(languagePriority) {
    let defaultLangCode = this.config.availableLanguages[0].code;
    this.translate.setDefaultLang("en");
    this.translate.use(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    this.setDirectionAccordingly(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
  }

  menuOpened() {
    if (this.userMe) {
      this.clientService.getUser(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
        if (res) {
          if (!res.ratings) res.ratings = 0;
          res.ratings = Number(res.ratings.toFixed(1));
        }
        console.log('getUser', res);
        this.userMe = res;
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(this.userMe));
      }, err => {
        console.log('getUser', err);
      });
    }
  }

  updatePlayerId() {
    this.oneSignal.getIds().then((id) => {
      if (id && id.userId) {
        let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
        this.clientService.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), {
          fcm_registration_id: id.userId,
          language: (defaultLang && defaultLang.length) ? defaultLang : this.config.availableLanguages[0].code
        }).subscribe(res => {
          console.log('updateUser', res);
        }, err => {
          console.log('updateUser', err);
        });
      }
    });
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar': {
        this.setDir('ltr');
        this.setDir('rtl');
        this.rtlSide = "right";
        break;
      }
      default: {
        this.setDir('rtl');
        this.setDir('ltr');
        this.rtlSide = "left";
        break;
      }
    }
    // this.translate.use('ar');
    // this.platform.setDir('ltr', false);
    // this.platform.setDir('rtl', true);
  }
  private setDir(dir: string)
  {
    document.documentElement.dir = dir;
  }

  initOneSignal() {
    if (this.config.oneSignalAppId && this.config.oneSignalAppId.length && this.config.oneSignalGPSenderId && this.config.oneSignalGPSenderId.length) {
      this.oneSignal.startInit(this.config.oneSignalAppId, this.config.oneSignalGPSenderId);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe((data) => {
        console.log(data);
        let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
        if (!notifications) notifications = new Array<MyNotification>();
        notifications.push(new MyNotification(data.payload.title, data.payload.body, moment().valueOf()));
        window.localStorage.setItem(Constants.KEY_NOTIFICATIONS, JSON.stringify(notifications));
        let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
        if (!noti_ids_processed) noti_ids_processed = new Array<string>();
        noti_ids_processed.push(data.payload.notificationID);
        window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
      });
      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
        if (!noti_ids_processed) noti_ids_processed = new Array<string>();
        let index = noti_ids_processed.indexOf(data.notification.payload.notificationID);
        if (index == -1) {
          let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
          if (!notifications) notifications = new Array<MyNotification>();
          notifications.push(new MyNotification(data.notification.payload.title, data.notification.payload.body, moment().valueOf()));
          window.localStorage.setItem(Constants.KEY_NOTIFICATIONS, JSON.stringify(notifications));
        } else {
          noti_ids_processed.splice(index, 1);
          window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
        }
      });
      this.oneSignal.endInit();
    }
  }

  home() {
      this.navCtrl.push("search");
      this.menu.close();
  }
  my_profile() {
      this.navCtrl.push("profile");
      this.menu.close();
  }
  my_trips() {
    this.navCtrl.push("trips");
    this.menu.close();
  }
  wallet() {
    this.navCtrl.push("wallet");
    this.menu.close();
  }
  promo_code() {
   this.navCtrl.push("promocode");
   this.menu.close();
  }
  help() {
    this.navCtrl.push("help");
    this.menu.close();
  }
  contact_us() {
     this.navCtrl.push("contact");
     this.menu.close();
  }

  managelanguage() {
    this.navCtrl.push("language");
    this.menu.close();
  }
  saved_address() {
     this.navCtrl.push("address");
     this.menu.close();
  }
  my_card() {
    this.navCtrl.push("cards");
    this.menu.close();
  }
  vouchers() {
    this.navCtrl.push("voucher");
    this.menu.close();
  }

  alertLogout() {
    this.translate.get(['logout_title', 'logout_message', 'no', 'yes']).subscribe(async text => {
      let alert = await this.alertCtrl.create({
        header: text['logout_title'],
        message: text['logout_message'],
        buttons: [{
          text: text['no'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }, {
          text: text['yes'],
          handler: () => {
            window.localStorage.removeItem(Constants.KEY_USER);
            window.localStorage.removeItem(Constants.KEY_PROFILE);
            window.localStorage.removeItem(Constants.KEY_TOKEN);
            this.navCtrl.push("signin");
          }
        }]
      });
      alert.present();
    });
  }
  developedBy() {
    const options: InAppBrowserOptions = {
      zoom: 'no'
    }
    const browser = this.inAppBrowser.create('https://verbosetechlabs.com/', '_system', options);
  }
}
