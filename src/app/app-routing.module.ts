import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Add_addressPage } from 'src/pages/add_address/add_address';
import { Add_cardPage } from 'src/pages/add_card/add_card';
import { Add_moneyPage } from 'src/pages/add_money/add_money';
import { BankTransfer } from 'src/pages/banktransfer/banktransfer';
import { Contact_usPage } from 'src/pages/contact_us/contact_us';
import { HelpPage } from 'src/pages/help/help';
import { ManagelanguagePage } from 'src/pages/managelanguage/managelanguage';
import { My_cardsPage } from 'src/pages/my_cards/my_cards';
import { My_profilePage } from 'src/pages/my_profile/my_profile';
import { My_tripsPage } from 'src/pages/my_trips/my_trips';
import { Promo_codePage } from 'src/pages/promo_code/promo_code';
import { Rate_ridePage } from 'src/pages/rate_ride/rate_ride';
import { Saved_addressPage } from 'src/pages/saved_address/saved_address';
import { SearchPage } from 'src/pages/search/search';
import { SigninPage } from 'src/pages/signin/signin';
import { SignupPage } from 'src/pages/signup/signup';
import { Trip_infoPage } from 'src/pages/trip_info/trip_info';
import { VerificationPage } from 'src/pages/verification/verification';
import { VouchersPage } from 'src/pages/vouchers/vouchers';
import { WalletPage } from 'src/pages/wallet/wallet';

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
