import { LoadingController, ToastController, AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Injectable } from "@angular/core";

@Injectable()
export class CommonUiElement {
    private loadingShown: Boolean = false;
    private loading;

    constructor(private loadingCtrl: LoadingController, private toastCtrl: ToastController,
        private alertCtrl: AlertController, private translate: TranslateService) {
    }

    async presentLoading(message: string) {
        this.loading = await this.loadingCtrl.create({
            message: message
        });
        this.loading.onDidDismiss(() => { });
        this.loading.present();
        this.loadingShown = true;
    }

    dismissLoading() {
        if (this.loadingShown) {
            this.loadingShown = false;
            this.loading.dismiss();
        }
    }

    async showToast(message: string) {
        let toast = await this.toastCtrl.create({
            message: message,
            duration: 3000,
            position: 'bottom'
        });
        toast.present();
    }

    presentErrorAlert(msg: string, tit?: string) {
        this.translate.get([tit ? tit : 'error', 'dismiss']).subscribe(async text => {
            let alert = await this.alertCtrl.create({
                header: text[tit ? tit : 'error'],
                subHeader: msg,
                buttons: [text['dismiss']]
            });
            alert.present();
        })
    }
}