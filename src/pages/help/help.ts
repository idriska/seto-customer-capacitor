import { Component } from '@angular/core';
import { CommonUiElement } from '../../services/app.commonelements';
import { ClientService } from '../../services/client.service';
import { Faq } from '../../models/faq.models';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { RouterWrapperService } from 'src/services/router-wrapper.service';

@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
  providers: [CommonUiElement, ClientService],
  styleUrls: ['help.scss']
})
export class HelpPage {
  private faqs = new Array<Faq>();
  private subscriptions: Array<Subscription> = [];
  private curFaqId;
  private isLoading = true;

  constructor(private translate: TranslateService, private service: ClientService,
    private cue: CommonUiElement, private navCtrl: RouterWrapperService) {
    let savedFaqs: Array<Faq> = JSON.parse(window.localStorage.getItem(Constants.KEY_FAQS));
    if (savedFaqs) {
      this.faqs = savedFaqs;
    } else {
      this.translate.get("loading").subscribe(value => this.cue.presentLoading(value));
    }
    this.refreshFaqs();
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.cue.dismissLoading();
  }

  refreshFaqs() {
    this.subscriptions.push(this.service.faqs().subscribe(res => {
      this.faqs = res;
      window.localStorage.setItem(Constants.KEY_FAQS, JSON.stringify(this.faqs));
      this.cue.dismissLoading();
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      console.log('faqs', err);
      this.cue.dismissLoading();
    }));
  }

  expandFaq(faq: Faq) {
    this.curFaqId = (this.curFaqId == faq.id) ? -1 : faq.id;
  }

}
