import { Component } from '@angular/core';
import { CommonUiElement } from '../../services/app.commonelements';
import { ClientService } from '../../services/client.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../models/user.models';
import { Constants } from '../../models/constants.models';
import { SupportRequest } from '../../models/support-request.models';
import { Subscription } from 'rxjs';
import { Helper } from '../../models/helper.models';
import { SearchPage } from '../search/search';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { RouterWrapperService } from 'src/services/router-wrapper.service';

@Component({
  selector: 'page-contact_us',
  templateUrl: 'contact_us.html',
  providers: [CommonUiElement, ClientService],
  styleUrls: ['contact_us.scss']
})
export class Contact_usPage {
  private userMe: User;
  private support_email = "";
  private support_phone = "";
  private support: SupportRequest = new SupportRequest('', '', '');
  private subscriptions: Array<Subscription> = [];

  constructor(private translate: TranslateService, private service: ClientService,
    private cue: CommonUiElement, private navCtrl: RouterWrapperService, private callNumber: CallNumber) {
    this.userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.support.name = this.userMe.name;
    this.support.email = this.userMe.email;
    let settingValues = Helper.getSettings(["support_email", "support_phone"]);
    if (settingValues.length) {
      this.support_email = settingValues[0];
      this.support_phone = settingValues[1];
    }
  }

  callSupport() {
    this.callNumber.callNumber(this.support_phone, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  mailSupport() {
    window.open(("mailto:" + this.support_email), "_system");
  }

  send() {
    if (!this.support.message.length) {
      this.translate.get('empty_msg').subscribe(value => {
        this.cue.showToast(value);
      });
    } else {
      this.translate.get('sending').subscribe(text => {
        this.cue.presentLoading(text);
        this.subscriptions.push(this.service.contactUs(window.localStorage.getItem(Constants.KEY_TOKEN), this.support).subscribe(res => {
          console.log("contactUs", res);
          this.cue.dismissLoading();
          this.translate.get('msg_submitted').subscribe(value => {
            this.cue.showToast(value);
          });
          this.navCtrl.push("search");
        }, err => {
          console.log('contactUs', err);
          this.cue.dismissLoading();
          this.navCtrl.push("search");
        }));
      });
    }
  }

}
