import { Component } from "@angular/core";
// import { Ride } from '../../models/ride.models';
import { CommonUiElement } from "../../services/app.commonelements";
import { ClientService } from "../../services/client.service";
import { Helper } from "../../models/helper.models";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { RateRequest } from "../../models/rate-request.models";
import { Constants } from "../../models/constants.models";
import { RouterWrapperService } from "src/app/services/router-wrapper.service";
import { Rating } from "src/app/interface/rating";
import { Ride } from "src/app/interface/ride";
import { DataService } from "src/app/services/data.service";

@Component({
  selector: "page-rate_ride",
  templateUrl: "rate_ride.html",
  providers: [ClientService, CommonUiElement],
  styleUrls: ["rate_ride.scss"],
})
export class Rate_ridePage {
  private ride: Ride;
  private rateRequest = new RateRequest();
  private subscriptions: Array<Subscription> = [];
  private currency: string;
  private distanceUnit: string;
  private rideTime: string;
  reviewText = "";

  constructor(
    private navCtrl: RouterWrapperService,
    private service: ClientService,
    private cue: CommonUiElement,
    private translate: TranslateService,
    private dataService: DataService
  ) {
    this.ride = this.navCtrl.getData("ride");

    if (!this.ride.driver.user.ratings) this.ride.driver.user.ratings = 0;
    this.ride.driver.user.ratings = Number(
      Number(this.ride.driver.user.ratings).toFixed(1)
    );
    this.rateRequest.rating = 3;
    let settings = Helper.getSettings(["currency", "unit"]);
    if (settings && settings.length > 0) {
      this.currency = settings[0];
      this.currency === "EUR" ? (this.currency = "€") : undefined;
    }
    // if (settings && settings.length > 1) this.distanceUnit = settings[1].toLowerCase();
    this.rideTime =
      (this.ride.estimated_time > 59
        ? (this.ride.estimated_time / 60).toFixed(1)
        : String(this.ride.estimated_time)) +
      " " +
      this.translate.instant(this.ride.estimated_time > 59 ? "hr" : "min");
  }

  setRating(rating) {
    this.rateRequest.rating = rating;
  }

  submitRating() {
    this.translate
      .get("submitting")
      .subscribe((value) => this.cue.showToast(value));
    this.rateRequest.review =
      this.reviewText && this.reviewText.length
        ? this.reviewText
        : "empty_review";

    
    let rating: Rating = {};
    rating.rating = this.rateRequest.rating;
    rating.review = this.rateRequest.review;
    rating.rating_from = String(this.ride.user);
    rating.rating_to = this.ride.driver['user']['_id'];;
    rating.ride = this.ride._id;

    this.dataService.resources.ratings.post(rating).subscribe(
      (res) => {
        window.localStorage.setItem(
          "rate" + this.ride._id,
          String(this.rateRequest.rating)
        );
        window.localStorage.setItem("ratecheck", String(this.ride._id));
        this.cue.dismissLoading();
        this.translate
          .get("submitted")
          .subscribe((value) => this.cue.showToast(value));
        this.navCtrl.pop();
      },
      (err) => {
        console.log("submit_rating", err);
        this.cue.dismissLoading();
      }
    );
  }
}
