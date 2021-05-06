import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonUiElement } from '../../services/app.commonelements';
import { Ride } from '../../models/ride.models';
import { GoogleMaps } from '../../services/google-maps';
import { Helper } from '../../models/helper.models';
import { RouterWrapperService } from 'src/app/services/router-wrapper.service';
// declare var google


@Component({
  selector: 'page-trip_info',
  templateUrl: 'trip_info.html',
  providers: [CommonUiElement],
  styleUrls: ["trip_info.scss"]
})
export class Trip_infoPage {
  @ViewChild('map') private mapElement: ElementRef;
  @ViewChild('pleaseConnect') private pleaseConnect: ElementRef;
  private ride: Ride;
  private fabAction: boolean;
  private distanceUnit: string;
  private currency: string;

  constructor(private maps: GoogleMaps, private navCtrl: RouterWrapperService) {
    this.currency = Helper.getSetting("currency");
    this.currency === 'EUR' ? this.currency = '€' : undefined
    this.ride = this.navCtrl.getData("ride");
    this.distanceUnit = Helper.getSetting("unit");
    if (this.distanceUnit && this.distanceUnit.length) this.distanceUnit = this.distanceUnit.toLowerCase();
  }

  ionViewDidEnter(): void {
    let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement, null).then(() => {
      this.plotPolyline();
    }).catch(err => {
      console.log(err);
      //this.close();
    });
    mapLoaded.catch(err => {
      console.log(err);
      //this.close();
    });
  }

  plotPolyline() {
    let posFrom = new google.maps.LatLng(Number(this.ride.latitude_from), Number(this.ride.longitude_from));
    let posTo = new google.maps.LatLng(Number(this.ride.latitude_to), Number(this.ride.longitude_to));

    let markerFrom = new google.maps.Marker({
      position: posFrom,
      map: this.maps.map,
      icon: 'assets/imgs/ic_loc_src.png'
    });

    let markerTo = new google.maps.Marker({
      position: posTo,
      map: this.maps.map,
      icon: 'assets/imgs/ic_loc_dest.png'
    });

    let directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer({
      map: this.maps.map,
      polylineOptions: {
        strokeColor: '#fdb036',
        strokeOpacity: 0.7,
        strokeWeight: 4
      },
      markerOptions: {
        opacity: 0,
        clickable: false,
        position: posFrom
      }
    });
    let dirReq: any = {
      origin: posFrom,
      destination: posTo,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(dirReq, function (result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(result);
      }
    });
  }

  toggleFab() {
    this.fabAction = !this.fabAction;
  }

  rateRider(ride) {
    this.navCtrl.pop();
    this.navCtrl.push("rate_ride", { ride: ride });
  }

}
