import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MyCardRequest } from '../../models/mycard-request.models';
import { CommonUiElement } from '../../services/app.commonelements';
import { ClientService } from '../../services/client.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MyCard } from '../../models/mycard.models';
import { RouterWrapperService } from 'src/services/router-wrapper.service';

@Component({
  selector: 'page-add_card',
  templateUrl: 'add_card.html',
  providers: [CommonUiElement, ClientService]
})
export class Add_cardPage {
  private subscriptions: Array<Subscription> = [];
  cardRequest = new MyCardRequest();
  card: MyCard = null;

  constructor(public navCtrl: RouterWrapperService, private global: CommonUiElement, private alertCtrl: AlertController,
    private service: ClientService, private translate: TranslateService) {
    this.card = this.navCtrl.getData("card")
    if (this.card != null) {
      this.cardRequest.cvc = "***";
      this.cardRequest.email = this.card.metadata.email;
      this.cardRequest.number = "**** **** **** " + this.card.last4;
      this.cardRequest.exp_month = this.card.exp_month;
      this.cardRequest.exp_year = this.card.exp_year;
      this.cardRequest.name = this.card.name;
      this.cardRequest.title = this.card.metadata.title;
    }
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.global.dismissLoading();
  }

  confirm() {
    if (this.card == null) {
      if (!this.cardRequest.number || this.cardRequest.number.length < 14) {
        this.translate.get("err_field_card_nummber").subscribe(value => this.global.showToast(value));
      } else if (!this.cardRequest.exp_month || this.cardRequest.exp_month.length != 2) {
        this.translate.get("err_field_card_exp_month").subscribe(value => this.global.showToast(value));
      } else if (!this.cardRequest.exp_year || this.cardRequest.exp_year.length != 2) {
        this.translate.get("err_field_card_exp_year").subscribe(value => this.global.showToast(value));
      } else if (!this.cardRequest.cvc || !this.cardRequest.cvc.length) {
        this.translate.get("err_field_card_cvc").subscribe(value => this.global.showToast(value));
      } else if (!this.cardRequest.name || !this.cardRequest.name.length) {
        this.translate.get("err_field_card_name").subscribe(value => this.global.showToast(value));
      } else if (!this.cardRequest.email || !this.cardRequest.email.length) {
        this.translate.get("err_field_card_email").subscribe(value => this.global.showToast(value));
      } else {
        this.translate.get(["saving", "something_went_wrong"]).subscribe(values => {
          this.global.presentLoading(values["saving"]);
          this.subscriptions.push(this.service.cardAdd(this.cardRequest).subscribe(res => {
            this.global.dismissLoading();
            console.log("cardAdd", res);
            this.navCtrl.pop();
          }, err => {
            this.global.dismissLoading();
            console.log("cardAdd", err);
            this.global.showToast((err.error && err.error.message) ? err.error.message : values["something_went_wrong"]);
          }));
        });
      }
    } else {
      this.translate.get(['delete_card_title', 'delete_card_message', 'no', 'yes', 'something_went_wrong', 'just_moment']).subscribe(async text => {
        let alert = await this.alertCtrl.create({
          header: text['delete_card_title'],
          message: text['delete_card_message'],
          buttons: [{
            text: text['no'],
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }, {
            text: text['yes'],
            handler: () => {
              this.global.presentLoading(text["just_moment"]);
              this.subscriptions.push(this.service.cardDelete(this.card.id).subscribe(res => {
                this.global.dismissLoading();
                this.navCtrl.pop();
              }, err => {
                this.global.dismissLoading();
                console.log("cardDelete", err);
                this.global.showToast((err.error && err.error.message) ? err.error.message : text["something_went_wrong"]);
              }));
            }
          }]
        });
        alert.present();
      });
    }
  }

}
