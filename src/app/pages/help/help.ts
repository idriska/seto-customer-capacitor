import { Component } from "@angular/core";
import { CommonUiElement } from "../../services/app.commonelements";
import { ClientService } from "../../services/client.service";
import { Faq } from "../../models/faq.models";
import { Observable, Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "../../models/constants.models";
import { RouterWrapperService } from "src/app/services/router-wrapper.service";
import { tap } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: "page-help",
  templateUrl: "help.html",
  providers: [CommonUiElement, ClientService],
  styleUrls: ["help.scss"],
})
export class HelpPage {
  private faqs = new Observable<Faq[]>();
  private subscriptions: Array<Subscription> = [];
  private curFaqId;
  private isLoading = true;

  constructor(
    private translate: TranslateService,
    private service: ClientService,
    private cue: CommonUiElement,
    private dataService: DataService
  ) {
    let savedFaqs: Array<Faq> = JSON.parse(
      window.localStorage.getItem(Constants.KEY_FAQS)
    );
    if (savedFaqs) {
      this.faqs = savedFaqs;
    } else {
      this.translate
        .get("loading")
        .subscribe((value) => this.cue.presentLoading(value));
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
    this.isLoading = true;
    this.faqs = this.dataService.resources.faqs.getAll().pipe(
      tap(() => {
        window.localStorage.setItem(
          Constants.KEY_FAQS,
          JSON.stringify(this.faqs)
        );
        this.isLoading = false;
        this.cue.dismissLoading();
      })
    )
  }

  expandFaq(faq: Faq) {
    this.curFaqId = this.curFaqId == faq.id ? -1 : faq.id;
  }
}
