import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ClientService } from "../../services/client.service";
import { CommonUiElement } from "../../services/app.commonelements";
import { Offer } from "../../models/offer.models";
import { Clipboard } from "@ionic-native/clipboard/ngx";
import { RouterWrapperService } from "src/app/services/router-wrapper.service";
import { DataService } from "src/app/services/data.service";
import { take } from "rxjs/operators";

@Component({
  selector: "page-vouchers",
  templateUrl: "vouchers.html",
  providers: [CommonUiElement, ClientService],
  styleUrls: ["vouchers.scss"],
})
export class VouchersPage {
  private subscriptions: Array<Subscription> = [];
  private allDone: boolean;
  private infiniteScroll: any;
  private pageNo: number = 0;
  offers = new Array<Offer>();
  isLoading: boolean = true;

  constructor(
    private navCtrl: RouterWrapperService,
    private global: CommonUiElement,
    private clipboard: Clipboard,
    private translate: TranslateService,
    private dataService: DataService
  ) {
    this.translate.get("loading").subscribe((value) => {
      this.global.presentLoading(value);
      this.loadOffers();
    });
  }

  copyCode(code) {
    if (code) {
      this.clipboard.copy(code);
      this.translate.get("copied_code").subscribe((value) => {
        this.global.showToast(value);
      });
    }
  }

  loadOffers() {
    this.dataService.resources.coupons
      .getAll({
        queryParams: {
          paginate: true,
          limit: 15,
          skip: this.pageNo,
        },
      })
      .pipe(take(1))
      .subscribe(
        (res) => {
          this.allDone = !res.data || !res.data.length;
          this.isLoading = false;
          this.offers = this.offers.concat(res.data);
          this.global.dismissLoading();
          if (this.infiniteScroll) this.infiniteScroll.target.complete();
        },
        (err) => {
          this.isLoading = false;
          console.log("getOffersList", err);
          this.global.dismissLoading();
          if (this.infiniteScroll) this.infiniteScroll.target.complete();
        }
      );
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.loadOffers();
    } else {
      infiniteScroll.target.complete();
    }
  }
}
