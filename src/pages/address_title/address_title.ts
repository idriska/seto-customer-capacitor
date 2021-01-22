import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Address } from '../../models/address.models';

@Component({
  selector: 'page-address_title',
  templateUrl: 'address_title.html'
})
export class Address_titlePage {
  private address: Address;

  constructor(navParam: NavParams) {
    this.address = navParam.get("address");
    if (!this.address) this.address = new Address();
    if (!this.address.title) this.address.title = "home";
  }

  dismiss() {
    //this.viewCtrl.dismiss(this.address);
  }
}
