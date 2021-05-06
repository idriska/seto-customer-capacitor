import { Component } from "@angular/core";
import { Trip_infoPage } from "../trip_info/trip_info";
import { ClientService } from "../../services/client.service";
import { CommonUiElement } from "../../services/app.commonelements";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Constants } from "../../models/constants.models";
import { Ride } from "../../models/ride.models";
import { Helper } from "../../models/helper.models";
import { Rate_ridePage } from "../rate_ride/rate_ride";
import { RouterWrapperService } from "src/app/services/router-wrapper.service";
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: "page-my_trips",
  templateUrl: "my_trips.html",
  providers: [ClientService, CommonUiElement],
  styleUrls: ["my_trips.scss"],
})
export class My_tripsPage {
  private subscriptions: Array<Subscription> = [];
  private rides = new Array<Ride>();
  private doneAll = false;
  private isLoading = true;
  private pageNo = 0;
  private infiniteScroll: any;
  private currency: string;

  constructor(
    private navCtrl: RouterWrapperService,
    private cue: CommonUiElement,
    private translate: TranslateService,
    private dataService: DataService
  ) {
    this.currency = Helper.getSetting("currency");
    this.currency === "EUR" ? (this.currency = "€") : undefined;
    this.translate.get("rides_loading").subscribe((value) => {
      this.cue.presentLoading(value);
      this.loadRides();
    });
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.cue.dismissLoading();
  }

  ionViewDidEnter() {
    let ratecheckId = window.localStorage.getItem("ratecheck");
    if (ratecheckId) {
      let index = -1;
      for (let i = 0; i < this.rides.length; i++) {
        if (Number(ratecheckId) == this.rides[i].id) {
          index = i;
          break;
        }
      }
      if (index != -1) {
        let rating = window.localStorage.getItem("rate" + this.rides[index].id);
        this.rides[index].myRating = rating ? Number(rating) : -1;
      }
    }
    window.localStorage.removeItem("ratecheck");
  }

  loadRides() {
    this.isLoading = true;

    this.dataService.resources.rides.getAll({queryParams: {
      sort: {_id: -1},
      limit: 10,
      relation: true,
      paginate: true,
      skip: this.pageNo,
      filter: {
        status: {$ne: 'pending'}
      }
    }}).subscribe(
      (res: any) => {
        this.rides = this.rides.concat(res.data);
        this.isLoading = false;
        this.doneAll = !res.data || !res.data.length;
        if (this.infiniteScroll) {
          this.infiniteScroll.target.complete();
        }
        this.cue.dismissLoading();
      },
      (err) => {
        this.isLoading = false;
        if (this.infiniteScroll) {
          this.infiniteScroll.target.complete();
        }
        this.cue.dismissLoading();
      }
    )
  }

  doInfinite(infiniteScroll: any) {
    if (this.doneAll) {
      infiniteScroll.target.complete();
    } else {
      this.infiniteScroll = infiniteScroll;
      this.pageNo = this.pageNo + 10;
      this.loadRides();
    }
  }

  tripInfo(ride) {
    this.navCtrl.push("trip_info", { ride: ride });
  }

  rateRider(ride) {
    this.navCtrl.push("rate_ride", { ride: ride });
  }
}
