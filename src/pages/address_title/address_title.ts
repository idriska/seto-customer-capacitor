import { Component } from '@angular/core';
import { Address } from '../../models/address.models';
import { RouterWrapperService } from 'src/services/router-wrapper.service';


@Component({
  selector: 'page-address_title',
  templateUrl: 'address_title.html',
  styleUrls: ["address_title.scss"]
})
export class Address_titlePage {
  private address: Address;

  constructor(private navCtrl: RouterWrapperService,) {
    this.address = this.navCtrl.getData("address");
    if (!this.address) this.address = new Address();
    if (!this.address.title) this.address.title = "home";
  }

  dismiss() {
    //this.viewCtrl.dismiss(this.address);
  }
}
