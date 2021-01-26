import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonUiElement } from '../../services/app.commonelements';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../services/client.service';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Platform } from '@ionic/angular';
import firebase from 'firebase';
import { Events } from 'src/services/event-handler.service';
import { RouterWrapperService } from 'src/services/router-wrapper.service';


@Component({
  selector: 'page-verification',
  templateUrl: 'verification.html',
  providers: [ClientService, CommonUiElement],
  styleUrls: ['verification.scss'],

})
export class VerificationPage {
  private recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  private phoneNumberFull: string;
  private interupted = true;
  private captchanotvarified = true;
  private otp: string;
  private result: any;

  private buttonDisabled: any = true;
  private component: any;
  private captchaVerified: boolean = false;
  private verfificationId: any;
  private timer: any;
  private minutes: number = 0;
  private seconds: number = 0;
  private totalSeconds: number = 0;
  private intervalCalled: boolean = false;
  private dialCode: string;
  private resendCode: boolean = false;
  private otpNotSent: boolean = true;

  constructor(@Inject(APP_CONFIG) config: AppConfig,
    private cue: CommonUiElement, private events: Events, private translate: TranslateService, private navCtrl: RouterWrapperService,
    private clientService: ClientService, private platform: Platform) {
    
      this.phoneNumberFull = this.navCtrl.getData("phoneNumberFull")
    }

  ionViewDidEnter() {
    if (!(this.platform.is('cordova'))) {
      this.makeCaptcha();
    }
    this.sendOTP();
  }

  sendOTP() {
    this.resendCode = false;
    this.otpNotSent = true;
    if (this.platform.is('cordova')) {
      this.sendOtpPhone(this.phoneNumberFull);
    } else {
      this.sendOtpBrowser(this.phoneNumberFull);
    }
    if (this.intervalCalled) {
      clearInterval(this.timer);
    }
  }

  createTimer() {
    this.intervalCalled = true;
    this.totalSeconds--;
    if (this.totalSeconds == 0) {
      this.otpNotSent = true;
      this.resendCode = true;
      clearInterval(this.timer);
    } else {
      this.seconds = (this.totalSeconds % 60);
      if (this.totalSeconds >= this.seconds) {
        this.minutes = (this.totalSeconds - this.seconds) / 60
      } else {
        this.minutes = 0;
      }
    }
  }

  createInterval() {
    this.totalSeconds = 120;
    this.createTimer();
    this.timer = setInterval(() => {
      this.createTimer();
    }, 1000);
  }

  getUserToken(user) {
    user.getIdToken(false).then(res => {
      console.log('user_token_success', res);
      this.loginUser(res);
    }).catch(err => {
      console.log('user_token_failure', err);
    });
  }

  loginUser(token) {
    this.translate.get('just_moment').subscribe(value => {
      this.cue.presentLoading(value);
    });
    this.clientService.login({ token: token, role: "customer" }).subscribe(resLogin => {
      this.cue.dismissLoading();
      window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(resLogin.user));
      window.localStorage.setItem(Constants.KEY_TOKEN, resLogin.token);
      this.events.publish("event:user", resLogin.user);
      this.navCtrl.push("search");
    }, err => {
      console.log(err);
      this.cue.dismissLoading();
      this.cue.presentErrorAlert((err && err.error && err.error.message && String(err.error.message).toLowerCase().includes("role")) ? "User exists with different role" : "Something went wrong");
    });
  }

  sendOtpPhone(phone) {
    this.translate.get('sending_otp').subscribe(value => {
      this.cue.presentLoading(value);
    });
    const component = this;
    (<any>window).FirebasePlugin.verifyPhoneNumber(phone, 60, function (credential) {
      console.log("verifyPhoneNumber", JSON.stringify(credential));
      component.verfificationId = credential.verificationId ? credential.verificationId : credential;
      // if instant verification is true use the code that we received from the firebase endpoint, otherwise ask user to input verificationCode:
      //var code = credential.instantVerification ? credential.code : inputField.value.toString();
      if (component.verfificationId) {
        if (credential.instantVerification && credential.code) {
          component.otp = credential.code;
          component.cue.showToast("Verified automatically");
          component.verifyOtpPhone();
        } else {
          component.translate.get("sending_otp_success").subscribe(value => {
            component.cue.showToast(value);
          });
          component.otpNotSent = false;
          component.createInterval();
        }
      }
      component.cue.dismissLoading();
    }, function (error) {
      console.log("otp_send_fail", error);
      component.otpNotSent = true;
      component.resendCode = true;
      component.cue.dismissLoading();
      component.translate.get('otp_send_fail').subscribe(value => {
        component.cue.showToast(value);
      });
    });
  }

  sendOtpBrowser(phone) {
    const component = this;
    this.cue.dismissLoading();
    this.cue.presentLoading("Sending otp");
    firebase.auth().signInWithPhoneNumber(phone, this.recaptchaVerifier).then((confirmationResult) => {
      console.log("otp_send_success", confirmationResult);
      component.otpNotSent = false;
      component.result = confirmationResult;
      component.cue.dismissLoading();
      component.cue.showToast("OTP Sent");
      if (component.intervalCalled) {
        clearInterval(component.timer);
      }
      component.createInterval();
    }).catch(function (error) {
      console.log("otp_send_fail", error);
      component.resendCode = true;
      component.cue.dismissLoading();
      if (error.message) {
        component.cue.showToast(error.message);
      } else {
        component.cue.showToast("OTP Sending failed");
      }
    });
  }

  verify() {
    this.otpNotSent = true;
    if (this.platform.is('cordova')) {
      this.verifyOtpPhone();
    } else {
      this.verifyOtpBrowser();
    }
  }

  verifyOtpPhone() {
    const credential = firebase.auth.PhoneAuthProvider.credential(this.verfificationId, this.otp);
    this.translate.get('verifying_otp').subscribe(value => {
      this.cue.presentLoading(value);
    });
    firebase.auth().signInAndRetrieveDataWithCredential(credential).then((info) => {
      console.log('otp_verify_success', info);
      this.cue.dismissLoading();
      this.translate.get('otp_verified').subscribe(value => {
        this.cue.showToast(value);
      });
      this.getUserToken(info.user);
    }, (error) => {
      console.log('otp_verify_fail', error);
      this.translate.get('verify_otp_err').subscribe(value => {
        this.cue.showToast(value);
      });
      this.cue.dismissLoading();
    })
  }

  verifyOtpBrowser() {
    const component = this;
    this.cue.presentLoading("Verifying otp");
    this.result.confirm(this.otp).then(function (response) {
      console.log('otp_verify_success', response);
      component.cue.dismissLoading();
      component.cue.showToast("OTP Verified");
      component.getUserToken(response.user);
    }).catch(function (error) {
      console.log('otp_verify_fail', error);
      if (error.message) {
        component.cue.showToast(error.message);
      } else {
        component.cue.showToast("OTP Verification failed");
      }
      component.cue.dismissLoading();
    });
  }

  makeCaptcha() {
    const component = this;
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      // 'size': 'normal',
      'size': 'invisible',
      'callback': function (response) {
        component.captchanotvarified = true;
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    this.recaptchaVerifier.render();
  }

}
