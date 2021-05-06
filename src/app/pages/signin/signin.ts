import { Component } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { CommonUiElement } from "../../services/app.commonelements";
import { ClientService } from "../../services/client.service";
import { TranslateService } from "@ngx-translate/core";
import { RouterWrapperService } from "src/app/services/router-wrapper.service";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: "page-signin",
  templateUrl: "signin.html",
  styleUrls: ["signin.scss"],

  providers: [CommonUiElement, ClientService],
})
export class SigninPage {
  private countries: any;
  private phoneNumber: string = "5530129507";
  private countryCode: string = "90";
  private phoneNumberFull: string;

  constructor(
    private navCtrl: RouterWrapperService,
    private cue: CommonUiElement,
    private service: ClientService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private authService: AuthService
  ) {
    this.getCountries();
  }

  getCountries() {
    this.service.getCountries().subscribe(
      (data) => {
        this.countries = data;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  alertPhone() {
    if (this.countryCode && this.phoneNumber) {
      this.translate
        .get(["alert_phone", "no", "yes"])
        .subscribe(async (text) => {
          this.phoneNumberFull = "+" + this.countryCode + this.phoneNumber;
          let alert = await this.alertCtrl.create({
            header: this.phoneNumberFull,
            message: text["alert_phone"],
            buttons: [
              {
                text: text["no"],
                role: "cancel",
                handler: () => {
                  console.log("Cancel clicked");
                },
              },
              {
                text: text["yes"],
                handler: () => {
                  this.checkIfExists();
                },
              },
            ],
          });
          alert.present();
        });
    }
  }

  checkIfExists() {
    const phoneNumber = this.phoneNumberFull.split("+");
    this.translate.get("just_moment").subscribe((value) => {
      this.cue.presentLoading(value);
    });

    this.authService
      .checkUserExists(phoneNumber[1], "customer")
      .then((res) => {
        this.cue.dismissLoading();
        this.navCtrl.push("verification", {
          phoneNumberFull: this.phoneNumberFull,
        });
      })
      .catch((e) => {
        this.cue.dismissLoading();
        this.navCtrl.push("signup", {
          code: this.countryCode,
          phone: this.phoneNumber,
        });
      });
  }

  signup() {
    this.navCtrl.push("signup");
  }
}
