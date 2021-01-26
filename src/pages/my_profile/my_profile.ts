import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { User } from '../../models/user.models';
import { Constants } from '../../models/constants.models';
import { CommonUiElement } from '../../services/app.commonelements';
import { ClientService } from '../../services/client.service';
import { FirebaseClient } from '../../services/firebase.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Crop } from '@ionic-native/crop/ngx';
import { File, FileEntry, Entry } from '@ionic-native/file/ngx';
import { ManagelanguagePage } from '../managelanguage/managelanguage';
import { SigninPage } from '../signin/signin';
import { RouterWrapperService } from 'src/services/router-wrapper.service';
import { Events } from 'src/services/event-handler.service';

@Component({
  selector: 'page-my_profile',
  templateUrl: 'my_profile.html',
  providers: [CommonUiElement, ClientService, FirebaseClient]
})
export class My_profilePage {
  private savedUser = new User();
  private progress: boolean = false;
  private fileToUpload: File;

  constructor(private navCtrl: RouterWrapperService, private imagePicker: ImagePicker,
    private file: File, private service: ClientService, private translate: TranslateService, private events: Events, private alertCtrl: AlertController,
    private _firebase: FirebaseClient, private cue: CommonUiElement, private cropService: Crop, private platform: Platform) {
    let savedUserIn = this.navCtrl.getData("savedUser");
    if (savedUserIn) {
      this.savedUser = savedUserIn;
    } else {
      this.savedUser = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    }
    // this.savedUser.image_url = "https://upload.wikimedia.org/wikipedia/commons/c/c6/Sierpinski_square.jpg";
    // setTimeout(() => {
    //   this.updateImage();
    // }, 2000);
  }

  pickImage() {
    if (this.progress)
      return;
    this.platform.ready().then(() => {
      if (this.platform.is("cordova")) {
        this.imagePicker.getPictures({
          maximumImagesCount: 1,
        }).then((results) => {
          if (results && results[0]) {
            this.reduceImages(results).then(() => {
              console.log('cropped_images');
            });
          }
        }, (err) => {
          console.log("getPictures", JSON.stringify(err));
        });
      }
    });
  }

  reduceImages(selected_pictures: any): any {
    return selected_pictures.reduce((promise: any, item: any) => {
      return promise.then((result) => {
        return this.cropService.crop(item, { quality: 100 }).then(cropped_image => {
          this.resolveUri(cropped_image);
        });
      });
    }, Promise.resolve());
  }

  resolveUri(uri: string) {
    console.log('uri: ' + uri);
    if (this.platform.is("android") && uri.startsWith('content://') && uri.indexOf('/storage/') != -1) {
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
        this.uploadCordova(dirPath, entry.name, mimeType);
      }, error => {
        console.log(error);
      });
    })
  }

  uploadCordova(path, name, mime) {
    console.log('original: ' + path);
    let dirPathSegments = path.split('/');
    dirPathSegments.pop();
    path = dirPathSegments.join('/');
    console.log('dir: ' + path);
    this.file.readAsArrayBuffer(path, name).then(buffer => {
      this.translate.get("uploading").subscribe(value => {
        this.cue.presentLoading(value);
      });
      this.progress = true;
      this._firebase.uploadBlob(new Blob([buffer], { type: mime })).then(url => {
        this.progress = false;
        this.cue.dismissLoading();
        console.log("Url is", url);
        this.savedUser.image_url = String(url);
        this.updateImage();
      }).catch(err => {
        this.progress = false;
        this.cue.dismissLoading();
        this.cue.showToast(JSON.stringify(err));
        console.log(err);
        this.translate.get("uploading_fail").subscribe(value => {
          this.cue.presentErrorAlert(value);
        });
      })
    }).catch(err => {
      this.cue.dismissLoading();
      this.cue.showToast(JSON.stringify(err));
      console.log(err);
    })
  }

  updateImage() {
    this.translate.get('saving').subscribe(value => {
      this.cue.presentLoading(value);
      this.service.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), { image_url: this.savedUser.image_url }).subscribe(res => {
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(this.savedUser));
        this.cue.dismissLoading();
        console.log(res);
        this.events.publish("event:user", res);
      }, err => {
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(this.savedUser));
        this.cue.dismissLoading();
        this.events.publish("event:user", this.savedUser);
        console.log('update_user', err);
      });
    });
  }

  managelanguage() {
    this.navCtrl.push("language");
  }

  alertLogout() {
    this.translate.get(['logout_title', 'logout_message', 'no', 'yes']).subscribe(async text => {
      let alert = await this.alertCtrl.create({
        header: text['logout_title'],
        message: text['logout_message'],
        buttons: [{
          text: text['no'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }, {
          text: text['yes'],
          handler: () => {
            window.localStorage.removeItem(Constants.KEY_USER);
            window.localStorage.removeItem(Constants.KEY_PROFILE);
            window.localStorage.removeItem(Constants.KEY_TOKEN);
            this.events.publish("event:user", null);
            this.navCtrl.push("signin");
          }
        }]
      });
      alert.present();
    });
  }

}
