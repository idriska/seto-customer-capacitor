import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ride } from 'src/app/interface/ride';
import { Helper } from 'src/app/models/helper.models';
import { CallNumber } from "@ionic-native/call-number/ngx";
import { TranslateService } from "@ngx-translate/core";
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'ride-info',
  templateUrl: './ride-info.component.html',
  styleUrls: ['./ride-info.component.scss'],
})
export class RideInfoComponent implements OnInit {

  @Input() page: string;
  @Input() ride: Ride;
  @Input() isAccept: boolean = false;
  @Output() fabFooterChange: EventEmitter<boolean> = new EventEmitter();
  @Output() rideStatusChange: EventEmitter<string> = new EventEmitter();

  currency: string;
  fabFooterAction: boolean = false;
  
  constructor(
    private callNumber: CallNumber,
    private translate: TranslateService,
    private alertCtrl: AlertController,
  ) { 
    this.currency = Helper.getSetting("currency");
    this.currency === 'EUR' ? this.currency = '€' : undefined
  }

  ngOnInit() {
    console.log("COMP PAGE", this.page)
    console.log("COMP RIDE", this.ride)
  }

  toggleFab() {
    this.fabFooterAction = !this.fabFooterAction;
    // this.fabFooterChange.emit(this.fabFooterAction) 
  }

  callRider() {
    this.callNumber
      .callNumber(this.ride.driver.user.mobile_number, true)
      .then((res) => console.log("Launched dialer!", res))
      .catch((err) => console.log("Error launching dialer", err));
  }

  updateRideStatus(status){
    this.rideStatusChange.emit(status)
  }

  confirmCancel() {
    this.translate
      .get(["cancel_ride_title", "cancel_ride_message", "no", "yes"])
      .subscribe(async (text) => {
        let alert = await this.alertCtrl.create({
          header: text["cancel_ride_title"],
          message: text["cancel_ride_message"],
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
              handler: () => this.updateRideStatus('cancelled'),
            },
          ],
        });
        alert.present();
      });
  }

}
