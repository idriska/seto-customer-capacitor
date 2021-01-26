import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CommonUiElement } from '../../services/app.commonelements';
import { ClientService } from '../../services/client.service';
import { FirebaseClient } from '../../services/firebase.service';
import { SignUpRequest } from '../../models/signup-request.models';
import { File, FileEntry, Entry } from '@ionic-native/file/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { TranslateService } from '@ngx-translate/core';
import { VerificationPage } from '../verification/verification';
import { RouterWrapperService } from 'src/services/router-wrapper.service';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  providers: [CommonUiElement, ClientService, FirebaseClient]
})
export class SignupPage {
  private signUpRequest = new SignUpRequest('', '', '', '');
  private countries: any;
  private phoneNumber: string;
  private countryCode: string = "49";
  private phoneNumberFull: string;
  private passwordConfirm: string;
  private progress: boolean = false;
  private fileToUpload: File;

  constructor( private clientService: ClientService, private cue: CommonUiElement, private firebaseService: FirebaseClient,
    private translate: TranslateService, private alertCtrl: AlertController, private navCtrl: RouterWrapperService,
    private imagePicker: ImagePicker, private cropService: Crop, private file: File) {
    let code = this.navCtrl.getData('code');
    let phone = this.navCtrl.getData('phone');
    let name = this.navCtrl.getData('name');
    let email = this.navCtrl.getData('email');
    if (code && code.length) {
      this.countryCode = code;
    }
    if (phone && phone.length) {
      this.phoneNumber = phone;
    }
    if (name && name.length) {
      this.signUpRequest.name = name;
    }
    if (email && email.length) {
      this.signUpRequest.email = email;
    }
    this.getCountries();
  }

  getCountries() {
    this.clientService.getCountries().subscribe(data => {
      this.countries = data;
    }, err => {
      console.log(err);
    })
  }

  requestSignUp() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!this.signUpRequest.name.length) {
      this.translate.get('err_valid_name').subscribe(value => {
        this.cue.showToast(value);
      });
    } else if (this.signUpRequest.email.length <= 5 || !reg.test(this.signUpRequest.email)) {
      this.translate.get('err_valid_email').subscribe(value => {
        this.cue.showToast(value);
      });
    } else if (!this.countryCode || !this.countryCode.length || !this.phoneNumber || !this.phoneNumber.length) {
      this.translate.get('err_valid_phone').subscribe(value => {
        this.cue.showToast(value);
      });
    }
    // else if (!this.signUpRequest.password || this.signUpRequest.password.length < 6 || this.signUpRequest.password != this.passwordConfirm) {
    //   this.translate.get('err_valid_password').subscribe(value => {
    //     this.cue.showToast(value);
    //   });
    // }
    else {
      this.alertPhone();
    }
  }

  alertPhone() {
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
        }, {
          text: text['yes'],
          handler: () => {
            this.signUpRequest.mobile_number = this.phoneNumberFull;
            this.signUp();
          }
        }]
      });
      alert.present();
    });
  }

  signUp() {
    this.translate.get('signing_up').subscribe(value => {
      this.cue.presentLoading(value);
      //this.signUpRequest.image_url = "https://image.freepik.com/free-vector/pack-of-colorful-square-emoticons_23-2147589525.jpg";
      this.clientService.signUp(this.signUpRequest).subscribe(res => {
        console.log(res);
        this.cue.dismissLoading();
        this.navCtrl.push("verification", { phoneNumberFull: res.user.mobile_number });
      }, err => {
        console.log(err);
        this.cue.dismissLoading();
        let errMsg = 'Unable to register with provided credentials, Either email or phone is already taken.';
        if (err && err.error && err.error.errors) {
          if (err.error.errors.email) {
            errMsg = err.error.errors.email[0];
          } else if (err.error.errors.mobile_number) {
            errMsg = err.error.errors.mobile_number[0];
          } else if (err.error.errors.password) {
            errMsg = err.error.errors.password[0];
          }
        }
        this.cue.presentErrorAlert(errMsg);
      });
    });
  }

  pickImage() {
    this.imagePicker.getPictures({ maximumImagesCount: 1 }).then((results) => {
      if (results && results[0]) {
        this.reduceImages(results).then(() => {
          console.log('cropped_images');
        });
      }
    }, (err) => {
      console.log(err);
      //this.editphoto();
    });
  }

  reduceImages(selected_pictures: any): any {
    return selected_pictures.reduce((promise: any, item: any) => {
      return promise.then((result) => {
        return this.cropService.crop(item, { quality: 75 }).then(cropped_image => {
          this.resolve(cropped_image);
        });
      });
    }, Promise.resolve());
  }

  resolve(uri: string) {
    console.log('uri: ' + uri);
    if (uri.startsWith('content://') && uri.indexOf('/storage/') != -1) {
      uri = "file://" + uri.substring(uri.indexOf("/storage/"), uri.length);
      console.log('file: ' + uri);
    }
    this.file.resolveLocalFilesystemUrl(uri).then((entry: Entry) => {
      console.log(entry);
      var fileEntry = entry as FileEntry;
      fileEntry.file(success => {
        var mimeType = success.type;
        console.log(mimeType);
        let dirPath = entry.nativeURL;
        this.upload(dirPath, entry.name, mimeType);
      }, error => {
        console.log(error);
      });
    })
  }

  upload(path, name, mime) {
    console.log('original: ' + path);
    let dirPathSegments = path.split('/');
    dirPathSegments.pop();
    path = dirPathSegments.join('/');
    console.log('dir: ' + path);
    this.file.readAsArrayBuffer(path, name).then(buffer => {
      this.cue.presentLoading("Uploading image");
      this.progress = true;
      this.firebaseService.uploadBlob(new Blob([buffer], { type: mime })).then(url => {
        this.cue.dismissLoading();
        this.cue.showToast("Image uploaded");
        console.log("Url is:", JSON.stringify(url));
        this.signUpRequest.image_url = String(url);
      }).catch(err => {
        this.progress = false;
        this.cue.dismissLoading();
        this.cue.showToast(JSON.stringify(err));
        console.log(err);
      })
    }).catch(err => {
      this.cue.dismissLoading();
      this.cue.showToast(JSON.stringify(err));
      console.log(err);
    })
  }

}