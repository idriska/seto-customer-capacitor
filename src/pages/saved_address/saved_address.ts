import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from '../../services/client.service';
import { CommonUiElement } from '../../services/app.commonelements';
import { Constants } from '../../models/constants.models';
import { Address } from '../../models/address.models';
import { Subscription } from 'rxjs';
import { MyLocation } from '../../models/my-location.models';
import { RouterWrapperService } from 'src/services/router-wrapper.service';

@Component({
  selector: 'page-saved_address',
  templateUrl: 'saved_address.html',
  providers: [CommonUiElement, ClientService]
})
export class Saved_addressPage {
  private subscriptions: Array<Subscription> = [];
  isLoading = true;
  addresses = new Array<Address>();
  pick = false;

  constructor(private navCtrl: RouterWrapperService, private translate: TranslateService,
    private clientService: ClientService, private cue: CommonUiElement, navParams: NavParams) {
    this.pick = navParams.get("pick");
    this.translate.get("loading").subscribe(value => {
      this.cue.presentLoading(value);
      this.loadAddresses();
    });
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.cue.dismissLoading();
  }

  ionViewDidEnter() {
    let address: Address = JSON.parse(window.localStorage.getItem(Constants.ADDRESS_EVENT));
    if (address && address.id) {
      if (!this.addresses) this.addresses = new Array<Address>();
      let existingPos = -1;
      for (let i = 0; i < this.addresses.length; i++) {
        if (this.addresses[i].id == address.id) {
          existingPos = i;
          break;
        }
      }
      if (existingPos != -1) this.addresses[existingPos] = address; else this.addresses.push(address);
      this.addresses = this.addresses;
    }
    window.localStorage.removeItem(Constants.ADDRESS_EVENT);
  }

  private loadAddresses() {
    this.subscriptions.push(this.clientService.getAddressList(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      this.isLoading = false;
      this.addresses = res;
      this.cue.dismissLoading();
    }, err => {
      this.isLoading = false;
      console.log('getAddressList', err);
      this.cue.dismissLoading();
    }));
  }

  addressPage(address: Address) {
    if (address != null && this.pick) {
      let myLocation = new MyLocation();
      myLocation.desc = address.address;
      myLocation.name = address.address;
      myLocation.lat = String(address.latitude);
      myLocation.lng = String(address.longitude);
      window.localStorage.setItem(Constants.KEY_LOCATION_TEMP, JSON.stringify(myLocation));
      this.navCtrl.pop();
    } else {
      this.navCtrl.push("add_address", { address: address });
    }
  }
}
