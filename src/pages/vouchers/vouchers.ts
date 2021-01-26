import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from '../../services/client.service';
import { CommonUiElement } from '../../services/app.commonelements';
import { Offer } from '../../models/offer.models';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { RouterWrapperService } from 'src/services/router-wrapper.service';

@Component({
  selector: 'page-vouchers',
  templateUrl: 'vouchers.html',
  providers: [CommonUiElement, ClientService]
})
export class VouchersPage {
  private subscriptions: Array<Subscription> = [];
  private allDone: boolean;
  private infiniteScroll: any;
  private pageNo: number = 1;
  offers = new Array<Offer>();
  isLoading: boolean = true;

  constructor(private navCtrl: RouterWrapperService, private global: CommonUiElement, private clipboard: Clipboard,
    private service: ClientService, private translate: TranslateService) {
    this.translate.get("loading").subscribe(value => {
      this.global.presentLoading(value);
      this.loadOffers();
    });
  }

  copyCode(code) {
    if (code) {
      this.clipboard.copy(code);
      this.translate.get('copied_code').subscribe(value => {
        this.global.showToast(value);
      });
    }
  }

  loadOffers() {
    this.subscriptions.push(this.service.getOffersList(this.pageNo).subscribe(res => {
      this.allDone = (!res.data || !res.data.length);
      this.isLoading = false;
      this.offers = this.offers.concat(res.data);
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
    }, err => {
      this.isLoading = false;
      console.log('getOffersList', err);
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
    }));
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.loadOffers();
    } else {
      infiniteScroll.complete();
    }
  }

}
