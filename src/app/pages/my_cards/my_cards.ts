import { Component } from "@angular/core";
import { CommonUiElement } from "../../services/app.commonelements";
import { ClientService } from "../../services/client.service";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Constants } from "../../models/constants.models";
import { RouterWrapperService } from "src/app/services/router-wrapper.service";
import { DataService } from "src/app/services/data.service";
import { User } from "src/app/interface/user";
import { take } from "rxjs/operators";
import { Card } from 'src/app/interface/card';

@Component({
  selector: "page-my_cards",
  templateUrl: "my_cards.html",
  providers: [CommonUiElement, ClientService],
  styleUrls: ["my_cards.scss"],
})
export class My_cardsPage {
  private subscriptions: Array<Subscription> = [];
  payment_method: string;
  titleToShow: string;
  myCards: Card[] = [];
  isLoading = true;
  pick = false;
  user: User;

  constructor(
    public navCtrl: RouterWrapperService,
    private global: CommonUiElement,
    private service: ClientService,
    private translate: TranslateService,
    private dataService: DataService
  ) {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.pick = this.navCtrl.getData("pick");
    this.payment_method = this.navCtrl.getData("payment_method");
    this.translate
      .get(
        this.pick && this.payment_method && this.payment_method.length
          ? this.payment_method.includes("business")
            ? "business_card_select"
            : "personal_card_select"
          : "my_card"
      )
      .subscribe((value) => (this.titleToShow = value));
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) =>
      subscription.unsubscribe()
    );
    this.global.dismissLoading();
  }

  ionViewDidEnter() {
    if (!this.myCards.length)
      this.global.presentLoading(this.translate.instant("loading"));
    this.isLoading = true;
    // this.subscriptions.push(
    //   this.service.cardGet().subscribe(
    //     (res) => {
    //       if (this.payment_method && this.payment_method.length) {
    //         let toShow = new Array<MyCard>();
    //         for (let card of res)
    //           if (this.payment_method.includes(card.metadata.title))
    //             toShow.push(card);
    //         this.myCards = toShow;
    //       } else {
    //         this.myCards = res;
    //       }
    //       this.isLoading = false;
    //       this.global.dismissLoading();
    //     },
    //     (err) => {
    //       console.log("cardGet", err);
    //       this.isLoading = false;
    //       this.global.dismissLoading();
    //     }
    //   )
    // );

    this.dataService.resources.cards
      .getAll({
        queryParams: {
          filter: { stripe_card_id: this.user.stripe_customer_id },
        },
      })
      .pipe(take(1))
      .subscribe(
        (res) => {
          if (this.payment_method && this.payment_method.length) {
            let toShow: Card[] = [];
            for (let card of res)
              if (this.payment_method.includes(card.metadata.title))
                toShow.push(card);
            this.myCards = toShow;
          } else {
            this.myCards = res;
          }
          this.isLoading = false;
          this.global.dismissLoading();
        },
        (err) => {
          console.log("cardGet", err);
          this.isLoading = false;
          this.global.dismissLoading();
        }
      );
  }

  navAddCard(card) {
    if (card != null && this.pick) {
      window.localStorage.setItem(
        Constants.KEY_CARD_TEMP,
        JSON.stringify(card)
      );
      this.navCtrl.pop();
    } else {
      this.navCtrl.push("addcards", { card: card });
    }
  }
}
