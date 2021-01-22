import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CommonUiElement } from '../../services/app.commonelements';
import { ClientService } from '../../services/client.service';
import { TranslateService } from '@ngx-translate/core';
import { RouterWrapperService } from 'src/services/router-wrapper.service';

@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
  styleUrls: ['signin.scss'],
  
  providers: [CommonUiElement, ClientService]
})
export class SigninPage {
  private countries: any;
  private phoneNumber: string;
  private countryCode: string = "43";
  private phoneNumberFull: string;

  constructor(private navCtrl: RouterWrapperService, private cue: CommonUiElement,
    private service: ClientService, private translate: TranslateService, private alertCtrl: AlertController) {
    this.getCountries();
  }

  getCountries() {
    this.service.getCountries().subscribe(data => {
      this.countries = data;
    }, err => {
      console.log(err);
    })
  }

  alertPhone() {
    if (this.countryCode && this.phoneNumber) {
      this.translate.get(['alert_phone', 'no', 'yes']).subscribe(async text => {
        this.phoneNumberFull = "+" + this.countryCode + this.phoneNumber;
        let alert = await this.alertCtrl.create({
          header: this.phoneNumberFull,
          message: text['alert_phone'],
          buttons: [{
            text: text['no'],
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: text['yes'],
            handler: () => {
              this.checkIfExists();
            }
          }]
        });
        alert.present();
      });
    }
  }

  checkIfExists() {
    this.translate.get('just_moment').subscribe(value => {
      this.cue.presentLoading(value);
      this.service.checkUser({ mobile_number: this.phoneNumberFull, role: "customer" }).subscribe(res => {
        console.log(res);
        this.cue.dismissLoading();
        this.navCtrl.push("verification", { phoneNumberFull: this.phoneNumberFull });
      }, err => {
        console.log(err);
        this.cue.dismissLoading();
        this.navCtrl.push("signup", { code: this.countryCode, phone: this.phoneNumber });
      });
    });
  }

  signup() {
    this.navCtrl.push("signup");
  }

}