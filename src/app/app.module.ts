import { RouteReuseStrategy } from "@angular/router";
import { BrowserModule } from "@angular/platform-browser";
import { LOCALE_ID, NgModule } from "@angular/core";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AppComponent } from "./app.component";
import { Add_moneyPage } from "./pages/add_money/add_money";
import { Contact_usPage } from "./pages/contact_us/contact_us";
import { HelpPage } from "./pages/help/help";
import { My_profilePage } from "./pages/my_profile/my_profile";
import { My_tripsPage } from "./pages/my_trips/my_trips";
import { Promo_codePage } from "./pages/promo_code/promo_code";
import { Rate_ridePage } from "./pages/rate_ride/rate_ride";
import { Ride_infoPage } from "./pages/ride_info/ride_info";
import { Trip_infoPage } from "./pages/trip_info/trip_info";
import { SearchPage } from "./pages/search/search";
import { SigninPage } from "./pages/signin/signin";
import { SignupPage } from "./pages/signup/signup";
import { VerificationPage } from "./pages/verification/verification";
import { WalletPage } from "./pages/wallet/wallet";
import { ManagelanguagePage } from "./pages/managelanguage/managelanguage";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { OneSignal } from "@ionic-native/onesignal/ngx";
import { Network } from "@ionic-native/network/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { File } from "@ionic-native/file/ngx";
import { ImagePicker } from "@ionic-native/image-picker/ngx";
import { Crop } from "@ionic-native/crop/ngx";
import { GoogleMaps } from "./services/google-maps";
import { Connectivity } from "./services/connectivity-service";
import { CallNumber } from "@ionic-native/call-number/ngx";
import { Clipboard } from "@ionic-native/clipboard/ngx";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { BaseAppConfig, APP_CONFIG } from "./app.config";
import { BankTransfer } from "./pages/banktransfer/banktransfer";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Add_cardPage } from "./pages/add_card/add_card";
import { Add_addressPage } from "./pages/add_address/add_address";
import { Saved_addressPage } from "./pages/saved_address/saved_address";
import { VouchersPage } from "./pages/vouchers/vouchers";
import { My_cardsPage } from "./pages/my_cards/my_cards";
import { Address_titlePage } from "./pages/address_title/address_title";

import { registerLocaleData } from "@angular/common";
import localeDe from "@angular/common/locales/de";
import { LanguageProvider } from "./services/language.service";
import { AppRoutingModule } from "./app-routing.module";
import { RouterWrapperService } from "src/app/services/router-wrapper.service";
import { Events } from "src/app/services/event-handler.service";
import { ClientService } from 'src/app/services/client.service';
import { CommonUiElement } from 'src/app/services/app.commonelements';
import { FormsModule } from '@angular/forms';

import { CommonService } from "./services/common.service";

import { EmptyCardComponent } from './components/empty-card/empty-card.component';
import { RideCardComponent } from './components/ride-card/ride-card.component';
import { HeadingsComponent } from './components/headings/headings.component';
import { MapCardComponent } from './components/map-card/map-card.component';
import { RideInfoComponent } from './components/ride-info/ride-info.component';


registerLocaleData(localeDe);

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
  declarations: [
    AppComponent,
    Add_moneyPage,
    Contact_usPage,
    HelpPage,
    My_profilePage,
    My_tripsPage,
    Promo_codePage,
    Rate_ridePage,
    Ride_infoPage,
    Trip_infoPage,
    SearchPage,
    SigninPage,
    SignupPage,
    VerificationPage,
    WalletPage,
    ManagelanguagePage,
    BankTransfer,
    Add_cardPage,
    Add_addressPage,
    Saved_addressPage,
    VouchersPage,
    My_cardsPage,
    Address_titlePage,

    EmptyCardComponent,
    RideCardComponent,
    HeadingsComponent,
    MapCardComponent,
    RideInfoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  bootstrap: [AppComponent],
  entryComponents: [],
  providers: [
    StatusBar,
    SplashScreen,
    OneSignal,
    CommonUiElement,
    Network,
    Geolocation,
    Events,
    RouterWrapperService,
    File,
    ImagePicker,
    Crop,
    GoogleMaps,
    Connectivity,
    CallNumber,
    Clipboard,
    SocialSharing,
    InAppBrowser,
    ClientService,
    { provide: APP_CONFIG, useValue: BaseAppConfig },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: LOCALE_ID,
      deps: [LanguageProvider],
      useFactory: (languageProvider) => languageProvider.getLanguage(),
    },
    LanguageProvider,
    CommonService
  ],
})
export class AppModule {}
