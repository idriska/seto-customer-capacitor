import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Add_addressPage } from 'src/app/pages/add_address/add_address';
import { Add_cardPage } from 'src/app/pages/add_card/add_card';
import { Add_moneyPage } from 'src/app/pages/add_money/add_money';
import { BankTransfer } from 'src/app/pages/banktransfer/banktransfer';
import { Contact_usPage } from 'src/app/pages/contact_us/contact_us';
import { HelpPage } from 'src/app/pages/help/help';
import { ManagelanguagePage } from 'src/app/pages/managelanguage/managelanguage';
import { My_cardsPage } from 'src/app/pages/my_cards/my_cards';
import { My_profilePage } from 'src/app/pages/my_profile/my_profile';
import { My_tripsPage } from 'src/app/pages/my_trips/my_trips';
import { Promo_codePage } from 'src/app/pages/promo_code/promo_code';
import { Rate_ridePage } from 'src/app/pages/rate_ride/rate_ride';
import { Saved_addressPage } from 'src/app/pages/saved_address/saved_address';
import { SearchPage } from 'src/app/pages/search/search';
import { SigninPage } from 'src/app/pages/signin/signin';
import { SignupPage } from 'src/app/pages/signup/signup';
import { Trip_infoPage } from 'src/app/pages/trip_info/trip_info';
import { VerificationPage } from 'src/app/pages/verification/verification';
import { VouchersPage } from 'src/app/pages/vouchers/vouchers';
import { WalletPage } from 'src/app/pages/wallet/wallet';

const routes: Routes = [
  {
    path: 'signin',
    component: SigninPage
  },
  {
    path: 'search',
    component: SearchPage
  },
  {
    path: 'profile',
    component: My_profilePage
  },
  {
    path: 'trips',
    component: My_tripsPage
  },
  {
    path: 'wallet',
    component: WalletPage
  },
  {
    path: 'promocode',
    component: Promo_codePage
  },
  {
    path: 'help',
    component: HelpPage
  },
  {
    path: 'contact',
    component: Contact_usPage
  },
  {
    path: 'language',
    component: ManagelanguagePage
  },
  {
    path: 'address',
    component: Saved_addressPage
  },
  {
    path: 'add_address',
    component: Add_addressPage
  },
  {
    path: 'cards',
    component: My_cardsPage
  },
  {
    path: 'addcards',
    component: Add_cardPage
  },
  {
    path: 'voucher',
    component: VouchersPage
  },
  {
    path: 'trip_info',
    component: Trip_infoPage
  },
  {
    path: 'rate_ride',
    component: Rate_ridePage
  },
  {
    path: 'verification',
    component: VerificationPage
  },
  {
    path: 'signup',
    component: SignupPage
  },
  {
    path: 'add_money',
    component: Add_moneyPage
  },
  {
    path: 'bank_transfer',
    component: BankTransfer
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
