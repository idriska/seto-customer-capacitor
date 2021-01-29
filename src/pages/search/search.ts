import {
  Component,
  NgZone,
  ViewChild,
  ElementRef,
  Inject,
} from "@angular/core";
import { AlertController } from "@ionic/angular";
import { GoogleMaps } from "../../services/google-maps";
import { MyLocation } from "../../models/my-location.models";
import { TranslateService } from "@ngx-translate/core";
import { CommonUiElement } from "../../services/app.commonelements";
import { Constants } from "../../models/constants.models";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { Subscription } from "rxjs";
import { VehicleType } from "../../models/vehicle-type.models";
import { Ride } from "../../models/ride.models";
import { ClientService } from "../../services/client.service";
import { CreateRideRequest } from "../../models/ride-request.models";
import { Helper } from "../../models/helper.models";
import { RideLocation } from "../../models/ride-location.models";
import { CallNumber } from "@ionic-native/call-number/ngx";
import { Driver } from "../../models/driver.models";
import { AppConfig, APP_CONFIG } from "../../app/app.config";
import { Offer } from "../../models/offer.models";
import { MyCard } from "../../models/mycard.models";
import firebase from "firebase";
import * as moment from "moment";
import { RouterWrapperService } from "src/services/router-wrapper.service";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
// declare var google;

import { interval } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';


@Component({
  selector: "page-search",
  templateUrl: "search.html",
  providers: [CommonUiElement, ClientService],
  styleUrls: ['search.scss'],
})
export class SearchPage {

  private phase = 1;
  @ViewChild("map") private mapElement: ElementRef;
  @ViewChild("pleaseConnect") private pleaseConnect: ElementRef;
  private autocompleteService: any;
  private placesService: any;
  private searchDisabled: boolean;
  private querySource: string;
  private queryDestination: string;
  private places: any = [];
  private searchingFor = 1;
  private locationSource: MyLocation;
  private locationDestination: MyLocation;
  private initialized: boolean;
  private fabAction: boolean;
  private fabFooterAction: boolean;
  private cardSelected: MyCard;
  private payment_method: string = "cash";
  private couponCodeToApply: string = "";
  couponCode: string = "";

  private subscriptions: Array<Subscription> = [];
  private vehicleTypes = new Array<VehicleType>();
  private vehicleTypeId = -1;
  private currency: string;
  private distanceUnit: string;
  private directionsDisplay: any;
  private markerFrom: google.maps.Marker;
  private markerTo: google.maps.Marker;
  private markerRide: google.maps.Marker;
  private markerRiders: Array<google.maps.Marker>;

  private ride: Ride;
  private lookupTimeLimit: number;
  private rideRef: firebase.database.Reference;
  private rideNewRef: firebase.database.Reference;
  private rideLocationRef: firebase.database.Reference;
  private timeoutVar;
  private subscriptionExistingRides: any;
  private isAccept: boolean = false;

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private navCtrl: RouterWrapperService,
    private zone: NgZone,
    private geolocation: Geolocation,
    private callNumber: CallNumber,
    private alertCtrl: AlertController,
    private cue: CommonUiElement,
    private maps: GoogleMaps,
    private translate: TranslateService,
    private clientService: ClientService,
    public inAppBrowser: InAppBrowser
  ) {
    this.currency = Helper.getSetting("currency");
    this.currency === "EUR" ? (this.currency = "€") : undefined;
    // this.locationSource = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION_SOURCE));
    // this.locationDestination = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION_DESTINATION));

    // if (this.locationSource)
    //   this.querySource = this.locationSource.desc;
    // if (this.locationDestination)
    //   this.queryDestination = this.locationDestination.desc;
  }

  loadVehicleTypes() {
    this.translate
      .get(["loading_rides", "loading_rides_fail"])
      .subscribe((values) => {
        this.cue.presentLoading(values["loading_rides"]);
        this.subscriptions.push(
          this.clientService
            .vehicleTypes(this.locationSource, this.locationDestination)
            .subscribe(
              (res) => {
                if (res.vehicle_types && res.vehicle_types.length) {
                  this.vehicleTypeId = res.vehicle_types[0].id;
                  this.loadNearbyDrivers();
                }
                this.vehicleTypes = res.vehicle_types;
                this.cue.dismissLoading();
              },
              (err) => {
                this.cue.presentErrorAlert(values["loading_rides_fail"]);
                console.log("vehicleTypes", err);
                this.cue.dismissLoading();
              }
            )
        );
      });
  }

  loadNearbyDrivers() {
    this.subscriptions.push(
      this.clientService
        .nearbyDrivers(
          window.localStorage.getItem(Constants.KEY_TOKEN),
          this.vehicleTypeId,
          this.locationSource
        )
        .subscribe(
          (res) => {
            this.plotDrivers(res);
          },
          (err) => {
            console.log("nearbyDrivers", err);
          }
        )
    );
  }

  plotDrivers(drivers: Array<Driver>) {
    if (this.markerRiders) {
      for (let mark of this.markerRiders) {
        mark.setMap(null);
      }
    } else {
      this.markerRiders = new Array();
    }

    let sizeDiff = drivers.length - this.markerRiders.length;
    if (sizeDiff > 0) {
      for (let i = 0; i < sizeDiff; i++) {
        this.markerRiders.push(
          new google.maps.Marker({
            position: new google.maps.LatLng(
              Number(drivers[i].current_latitude),
              Number(drivers[i].current_longitude)
            ),
            map: this.maps.map,
            title: drivers[i].user.name,
            icon: "assets/imgs/map_car_mini.png",
          })
        );
      }
      for (let i = 0; i < this.markerRiders.length - sizeDiff; i++) {
        this.markerRiders[i].setPosition(
          new google.maps.LatLng(
            Number(drivers[i + sizeDiff].current_latitude),
            Number(drivers[i + sizeDiff].current_longitude)
          )
        );
        this.markerRiders[i].setTitle(drivers[i + sizeDiff].user.name);
        this.markerRiders[i].setMap(this.maps.map);
      }
    } else {
      for (let i = 0; i < drivers.length; i++) {
        this.markerRiders[i].setPosition(
          new google.maps.LatLng(
            Number(drivers[i].current_latitude),
            Number(drivers[i].current_longitude)
          )
        );
        this.markerRiders[i].setTitle(drivers[i].user.name);
        this.markerRiders[i].setMap(this.maps.map);
      }
    }

    let posBonds = new google.maps.LatLngBounds();
    for (let mr of this.markerRiders) {
      if (mr.getMap() != null && mr.getPosition() != null)
        posBonds.extend(mr.getPosition());
    }
    posBonds.extend(
      new google.maps.LatLng(
        Number(this.locationSource.lat),
        Number(this.locationSource.lng)
      )
    );
    posBonds.extend(
      new google.maps.LatLng(
        Number(this.locationDestination.lat),
        Number(this.locationDestination.lng)
      )
    );
    if (!posBonds.isEmpty()) {
      setTimeout(() => {
        this.maps.map.fitBounds(posBonds);
      }, 200);
    }
  }

  ionViewWillLeave() {
    console.log("IonViewWillLeave")
    this.subscriptions.forEach((subscription: Subscription) =>
      subscription.unsubscribe()
    );
    this.cue.dismissLoading();

    if (this.ride && this.ride.status == "pending") {
      this.clientService
        .rideCancel(
          window.localStorage.getItem(Constants.KEY_TOKEN),
          this.ride.id
        )
        .subscribe(
          (res) => {
            this.rideRef.set(res);
            this.clearToPhase(1);
            this.cue.dismissLoading();
          },
          (err) => {
            this.clearToPhase(1);
            console.log("cancel_err", err);
            this.cue.dismissLoading();
          }
        );
    }
    if (this.timeoutVar) clearTimeout(this.timeoutVar);
    if (this.rideRef) this.rideRef.off("value");
    if (this.rideLocationRef) this.rideLocationRef.off("value");
  }

  ionViewDidEnter(): void {
    if (!this.initialized) {
      let mapLoaded = this.maps
        .init(
          this.mapElement.nativeElement,
          this.pleaseConnect.nativeElement,
          this.locationSource
        )
        .then(() => {
          this.autocompleteService = new google.maps.places.AutocompleteService();
          console.log("autocompleteService", this.autocompleteService)
          this.placesService = new google.maps.places.PlacesService(
            this.maps.map
            );
          this.searchDisabled = false;
          
          // this.maps.map.addListener('click', (event) => {
          //   if (event && event.latLng) {
          //     this.onMapClick(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
          //   }
          // });
          this.initialized = true;
          if (
            !this.locationSource ||
            !this.locationSource.lat ||
            !this.locationSource.lng
          )
            this.detect();
          this.checkPlotPolyline();
          this.checkExistingRides();
        })
        .catch((err) => {
          console.log(err);
          //this.close();
        });
      mapLoaded.catch((err) => {
        console.log(err);
        //this.close();
      });
    }

    // ionViewDidLeave()
    let locationTemp = JSON.parse(
      window.localStorage.getItem(Constants.KEY_LOCATION_TEMP)
    );
    if (locationTemp != null) this.markLocationSelected(locationTemp);
    window.localStorage.removeItem(Constants.KEY_LOCATION_TEMP);

    let cardTemp = JSON.parse(
      window.localStorage.getItem(Constants.KEY_CARD_TEMP)
    );
    if (cardTemp != null) {
      this.cardSelected = cardTemp;
      this.next();
    }
    window.localStorage.removeItem(Constants.KEY_CARD_TEMP);
  }

  // ionViewDidLeave() {
  //   console.log("IonViewDidLeave")
  //   let locationTemp = JSON.parse(
  //     window.localStorage.getItem(Constants.KEY_LOCATION_TEMP)
  //   );
  //   if (locationTemp != null) this.markLocationSelected(locationTemp);
  //   window.localStorage.removeItem(Constants.KEY_LOCATION_TEMP);

  //   let cardTemp = JSON.parse(
  //     window.localStorage.getItem(Constants.KEY_CARD_TEMP)
  //   );
  //   if (cardTemp != null) {
  //     this.cardSelected = cardTemp;
  //     this.next();
  //   }
  //   window.localStorage.removeItem(Constants.KEY_CARD_TEMP);
  // }

  checkExistingRides() {
    this.translate.get("rides_loading_ongoing").subscribe((value) => {
      //this.cue.presentLoading(value);
      this.clientService
        .myRides(window.localStorage.getItem(Constants.KEY_TOKEN), 1)
        .subscribe(
          (res) => {
            this.cue.dismissLoading();
            if (res.data && res.data.length) {
              res.data.sort((a, b) => (a.id > b.id ? -1 : 1));
              let firstRide = res.data[0];
              if (
                firstRide.status == "accepted" ||
                firstRide.status == "onway" ||
                firstRide.status == "ongoing" ||
                firstRide.status == "processing_payment" ||
                firstRide.status == "pending_accept" ||
                firstRide.status == "accept_payment"
              ) {
                this.registerRideUpdates(firstRide);
                this.subscriptionExistingRides
                  ? this.subscriptionExistingRides.unsubscribe()
                  : undefined;
                this.phase = 3;
              }
            }
          },
          (err) => {
            console.log("myRides", err);
            //this.cue.dismissLoading();
          }
        );
    });
  }

  checkPlotPolyline() {
    const component = this;
    let posFrom = null;
    let posTo = null;
    if (
      this.locationSource &&
      this.locationSource.lat &&
      this.locationSource.lng
    )
      posFrom = new google.maps.LatLng(
        Number(this.locationSource.lat),
        Number(this.locationSource.lng)
      );
    if (
      this.locationDestination &&
      this.locationDestination.lat &&
      this.locationDestination.lng
    )
      posTo = new google.maps.LatLng(
        Number(this.locationDestination.lat),
        Number(this.locationDestination.lng)
      );

    if (!posTo && this.markerTo) this.markerTo.setMap(null);

    if (posFrom) {
      if (this.markerFrom) {
        this.markerFrom.setMap(this.maps.map);
        this.markerFrom.setPosition(posFrom);
        this.maps.map.panTo(posFrom);
      } else {
        var icon = {
          url: "assets/imgs/ic_loc_src.png", // url
          scaledSize: new google.maps.Size(80, 80), // scaled size
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(40, 50), // anchor
        };

        this.markerFrom = new google.maps.Marker({
          position: posFrom,
          map: this.maps.map,
          icon: icon,
        });

        this.maps.map.panTo(posFrom);
      }

      if (posTo) {
        if (this.markerTo) {
          this.markerTo.setMap(this.maps.map);
          this.markerTo.setPosition(posTo);
        } else {
          this.markerTo = new google.maps.Marker({
            position: posTo,
            map: this.maps.map,
            icon: "assets/imgs/ic_loc_dest.png",
          });
        }
      }
    } else {
      if (this.markerFrom) this.markerFrom.setMap(null);
      if (this.markerTo) this.markerTo.setMap(null);
    }

    if (posFrom && posTo) {
      if (!this.directionsDisplay) {
        this.directionsDisplay = new google.maps.DirectionsRenderer({
          map: this.maps.map,
          polylineOptions: {
            strokeColor: "#fdb036",
            strokeOpacity: 0.7,
            strokeWeight: 4,
          },
          markerOptions: {
            opacity: 0,
            clickable: false,
            position: posFrom,
          },
        });
      }
      let dirReq: any = {
        origin: posFrom,
        destination: posTo,
        travelMode: google.maps.TravelMode.DRIVING,
      };
      let directionsService = new google.maps.DirectionsService();
      directionsService.route(dirReq, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          component.directionsDisplay.setDirections(result);
        }
      });
    } else if (this.directionsDisplay) {
      this.directionsDisplay.set("directions", null);
    }
  }

  detect() {
    this.geolocation
      .getCurrentPosition()
      .then((position) => {
        let geocoder = new google.maps.Geocoder();
        let pos = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        let request = { location: pos };
        geocoder.geocode(request, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
            let myLocation = new MyLocation();
            myLocation.name = results[0].formatted_address;
            myLocation.desc = results[0].formatted_address;
            myLocation.lat = String(pos.lat());
            myLocation.lng = String(pos.lng());

            this.locationSource = myLocation;
            this.querySource = myLocation.desc;
            this.checkPlotPolyline();
            // this.changeCenter(pos.lat(), pos.lng());
            // if (this.searchingFor == 1)
            //   this.locationSource = myLocation;
            // else
            //   this.locationDestination = myLocation;
            // window.localStorage.setItem((this.searchingFor == 1 ? Constants.KEY_LOCATION_SOURCE : Constants.KEY_LOCATION_DESTINATION), JSON.stringify(myLocation));
            //this.maps.map.panTo(pos);
          }
        });
      })
      .catch((err) => {
        console.log("getCurrentPosition", err);
        this.translate
          .get("location_detection_failed")
          .subscribe((value) => this.cue.showToast(value));
      });
  }

  searchPlaceSource(querySource) {
    // console.log(querySource)
    if (!querySource || !querySource.length) {
      this.locationSource = null;
      this.checkPlotPolyline();
      this.phase = 1;
      window.localStorage.removeItem(Constants.KEY_LOCATION_SOURCE);
    }
    this.searchingFor = 1;
    this.searchPlace(querySource);
  }

  searchPlaceDestination(queryDestination) {
    // console.log(queryDestination)
    if (!queryDestination || !queryDestination.length) {
      this.locationDestination = null;
      this.checkPlotPolyline();
      this.phase = 1;
      window.localStorage.removeItem(Constants.KEY_LOCATION_DESTINATION);
    }
    this.searchingFor = 2;
    this.searchPlace(queryDestination);
  }

  searchPlace(query: string) {
    if (query.length > 0 && !this.searchDisabled) {
      let config = {
        input: query,
        componentRestrictions: { country: "AT" },
      };
      this.autocompleteService.getPlacePredictions(
        config,
        (predictions, status) => {
          if (
            status == google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            this.places = [];
            predictions.forEach((prediction) => this.places.push(prediction));
          }
        }
      );
    } else {
      this.places = [];
    }
  }

  selectPlace(place) {
    if (this.searchingFor == 1) this.querySource = place.description;
    else this.queryDestination = place.description;
    // this.ignoreClick = true;
    // setTimeout(() => {
    //   this.ignoreClick = false;
    //   console.log(this.query);
    // }, 2000);
    this.places = [];
    let myLocation = new MyLocation();
    myLocation.name = place.name;
    myLocation.desc = place.description;
    this.placesService.getDetails({ placeId: place.place_id }, (details) => {
      this.zone.run(() => {
        myLocation.name =
          details.formatted_address && details.formatted_address.length
            ? details.formatted_address
            : details.name;
        myLocation.lat = String(details.geometry.location.lat());
        myLocation.lng = String(details.geometry.location.lng());
        // //this.saveDisabled = false;
        // let lc = { lat: Number(myLocation.lat), lng: Number(myLocation.lng) };
        // this.changeCenter(lc.lat, lc.lng);
        // if (this.searchingFor == 1)
        //   this.locationSource = myLocation;
        // else
        //   this.locationDestination = myLocation;
        // window.localStorage.setItem((this.searchingFor == 1 ? Constants.KEY_LOCATION_SOURCE : Constants.KEY_LOCATION_DESTINATION), JSON.stringify(myLocation));
        // let pos = new google.maps.LatLng(lc.lat, lc.lng);
        // // if (!this.marker)
        // //   this.marker = new google.maps.Marker({ position: pos, map: this.maps.map });
        // // else
        // //   this.marker.setPosition(pos);
        // this.maps.map.panTo(pos);
        // this.checkPlotPolyline();
        this.markLocationSelected(myLocation);
      });
    });
  }

  private markLocationSelected(myLocation: MyLocation) {
    //this.saveDisabled = false;
    let lc = { lat: Number(myLocation.lat), lng: Number(myLocation.lng) };
    this.changeCenter(lc.lat, lc.lng);
    if (this.searchingFor == 1) {
      this.querySource = myLocation.desc;
      this.locationSource = myLocation;
    } else {
      this.queryDestination = myLocation.desc;
      this.locationDestination = myLocation;
    }
    window.localStorage.setItem(
      this.searchingFor == 1
        ? Constants.KEY_LOCATION_SOURCE
        : Constants.KEY_LOCATION_DESTINATION,
      JSON.stringify(myLocation)
    );
    let pos = new google.maps.LatLng(lc.lat, lc.lng);
    // if (!this.marker)
    //   this.marker = new google.maps.Marker({ position: pos, map: this.maps.map });
    // else
    //   this.marker.setPosition(pos);
    this.maps.map.panTo(pos);
    this.checkPlotPolyline();
  }

  changeCenter(newLat: number, newLng: number) {
    this.maps.map.panTo(new google.maps.LatLng(newLat, newLng));
  }

  verifyCode() {
    if (this.couponCode && this.couponCode.length) {
      this.translate
        .get(["verifying_code", "applied_code", "invalid_code"])
        .subscribe((values) => {
          this.cue.presentLoading(values["verifying_code"]);
          this.subscriptions.push(
            this.clientService.verifyOffer(this.couponCode).subscribe(
              (res) => {
                this.cue.dismissLoading();
                let coupon: Offer = res;
                if (
                  !coupon ||
                  !(moment(coupon.expires_at).diff(moment()) > 0)
                ) {
                  this.cue.showToast(values["invalid_code"]);
                  this.couponCode = "";
                } else {
                  this.couponCodeToApply = res.code;
                  this.cue.showToast(values["applied_code"]);
                }
              },
              (err) => {
                console.log("verifyOffer", err);
                this.cue.dismissLoading();
                this.cue.showToast(values["invalid_code"]);
                this.couponCode = "";
              }
            )
          );
        });
    }
  }

  next() {
    if (this.phase == 1) {
      if (!this.locationSource) {
        this.translate
          .get("enter_source")
          .subscribe((value) => this.cue.showToast(value));
      } else if (!this.locationDestination) {
        this.translate
          .get("enter_destination")
          .subscribe((value) => this.cue.showToast(value));
      } else if (!this.payment_method) {
        this.translate
          .get("choose_payment")
          .subscribe((value) => this.cue.showToast(value));
        this.fabAction = true;
      } else {
        if (
          this.payment_method.includes("card_") &&
          this.cardSelected == null
        ) {
          this.navCtrl.push("cards", {
            pick: true,
            payment_method: this.payment_method,
          });
        } else {
          window.localStorage.setItem(
            Constants.KEY_LOCATION_SOURCE,
            JSON.stringify(this.locationSource)
          );
          window.localStorage.setItem(
            Constants.KEY_LOCATION_DESTINATION,
            JSON.stringify(this.locationDestination)
          );
          this.phase = 2;
          let settings = Helper.getSettings(["currency", "unit"]);
          if (settings && settings.length > 0) {
            this.currency = settings[0];
            this.currency === "EUR" ? (this.currency = "€") : undefined;
          }
          if (settings && settings.length > 1)
            this.distanceUnit = settings[1].toLowerCase();
          this.loadVehicleTypes();
          // this.navCtrl.push(Searchin_cabPage, {
          //   locationFrom: this.locationSource,
          //   locationTo: this.locationDestination,
          //   payment: this.payment_method
          // });
        }
      }
    } else if (this.phase == 2) {
      if (this.vehicleTypeId == -1) {
        this.translate
          .get("choose_vehicle_type")
          .subscribe((value) => this.cue.showToast(value));
      } else {
        let crr = new CreateRideRequest();
        crr.vehicle_type_id = this.vehicleTypeId;
        crr.ride_on = moment().format("YYYY-MM-DD HH:mm");
        crr.payment_method = this.payment_method.includes("card_")
          ? "stripe"
          : this.payment_method;
        if (this.payment_method.includes("card_"))
          crr.stripe_card_id = this.cardSelected.id;
        crr.address_from = this.locationSource.name;
        crr.latitude_from = this.locationSource.lat;
        // crr.latitude_from = "28.603187199999997";
        // crr.longitude_from = "77.07361279999999";
        crr.longitude_from = this.locationSource.lng;
        crr.address_to = this.locationDestination.name;
        crr.latitude_to = this.locationDestination.lat;
        crr.longitude_to = this.locationDestination.lng;
        if (this.couponCodeToApply && this.couponCodeToApply.length)
          crr.coupon = this.couponCodeToApply;
        this.translate.get("requesting_ride").subscribe((value) => {
          this.cue.presentLoading(value);
          this.subscriptions.push(
            this.clientService
              .createRide(window.localStorage.getItem(Constants.KEY_TOKEN), crr)
              .subscribe(
                (res) => {
                  this.cue.dismissLoading();
                  this.registerMyRideUpdates(res);

                  //TODO: spica real time database

                  this.subscriptionExistingRides = interval(5000).pipe(
                  take(600),
                  switchMap(async () => this.checkExistingRides()))
                  .subscribe(() => {})
                },
                (err) => {
                  this.cue.dismissLoading();
                  console.log("createRide", err);
                  let translateKey =
                    err.status && err.status == 404
                      ? "create_ride_err_driver"
                      : err.message &&
                        err.message.length &&
                        err.status &&
                        err.status == 422
                      ? "create_ride_err_wallet"
                      : "create_ride_err";
                  this.translate
                    .get(translateKey)
                    .subscribe((value) => this.cue.presentErrorAlert(value));
                }
              )
          );
        });
      }
    }
  }

  registerMyRideUpdates(newRide) {
    this.setupRide(newRide);
    this.ride = newRide;
    const component = this;
    this.rideNewRef = firebase
      .database()
      .ref("rides")
      .child(String(newRide.id));
    this.rideNewRef.on("value", function (data) {
      let ride = data.val() as Ride;
      if (ride != null && ride.driver != null && ride.driver_id != null) {
        component.registerRideUpdates(ride);
        if (component.rideNewRef) {
          component.rideNewRef.off("value");
          component.rideNewRef = null;
        }
      }
    });

    if (newRide.status == "pending") {
      this.lookupTimeLimit =
        Number(Helper.getSetting("ride_accept_minutes_limit")) * 60000;
      this.timeoutVar = setTimeout(() => {
        this.cancelSearch();
        if (this.rideNewRef) {
          this.rideNewRef.off("value");
          this.rideNewRef = null;
        }
      }, this.lookupTimeLimit);
    }
  }

  registerRideUpdates(newRide) {
    const component = this;
    component.presetRide(newRide);
    this.rideRef = firebase
      .database()
      .ref("driver")
      .child(String(this.ride.driver_id))
      .child("ride");
    this.rideRef.set(this.ride);
    this.rideRef.on("value", function (data) {
      let ride = data.val() as Ride;
      if (ride && ride.status) {
        component.presetRide(ride);
        if (component.ride.status != "pending") {
          if (component.timeoutVar) clearTimeout(component.timeoutVar);
          component.phase = 3;
        }
        if (
          component.ride.status == "cancelled" ||
          component.ride.status == "rejected" ||
          component.ride.status == "complete"
        ) {
          if (component.ride.status == "complete") {
            component.isAccept = false;
            component.navCtrl.push("rate_ride", { ride: component.ride });
          }
          component.translate
            .get("ride_status_" + component.ride.status)
            .subscribe((value) => component.cue.showToast(value));
          component.clearToPhase(component.ride.status == "rejected" ? 2 : 1);
        }
      }
    });

    if (this.ride.status == "pending") {
      this.lookupTimeLimit =
        Number(Helper.getSetting("ride_accept_minutes_limit")) * 60000;
      this.timeoutVar = setTimeout(() => {
        this.cancelSearch();
        this.rideRef.off("value");
      }, this.lookupTimeLimit);
    }
  }

  clearToPhase(phaseNum: number) {
    this.phase = phaseNum;
    if (this.rideRef) {
      this.rideRef.off("value");
      this.rideRef = null;
    }
    if (this.rideNewRef) {
      this.subscriptionExistingRides
        ? this.subscriptionExistingRides.unsubscribe()
        : undefined;
      this.rideNewRef.off("value");
      this.rideNewRef = null;
    }
    if (this.rideLocationRef) {
      this.rideLocationRef.off("value");
      this.rideLocationRef = null;
    }
    if (this.markerRide) {
      this.markerRide.setMap(null);
      this.markerRide = null;
    }
    this.ride = null;
    if (phaseNum == 1) {
      this.vehicleTypes = [];
      this.vehicleTypeId = -1;
    }
  }

  private setupRide(ride) {
    if (!ride.user)
      ride.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    if (!ride.estimated_time) ride.estimated_time = 0;
    ride.estimated_time = Number(ride.estimated_time.toFixed());
    if (!ride.estimated_pickup_distance) ride.estimated_pickup_distance = 0;
    ride.estimated_pickup_distance = Number(
      Number(ride.estimated_pickup_distance).toFixed()
    );
    if (!ride.estimated_distance) ride.estimated_distance = 0;
    ride.estimated_distance = Number(
      Number(ride.estimated_distance).toFixed(1)
    );
    if (!ride.estimated_pickup_time) ride.estimated_pickup_time = 0;
    ride.estimated_pickup_time = Number(ride.estimated_pickup_time.toFixed());
    if (!ride.driver) ride.driver = new Driver();
    if (!ride.driver.user.ratings) ride.driver.user.ratings = 0;
    ride.driver.user.ratings = Number(ride.driver.user.ratings.toFixed(1));
  }

  presetRide(ride) {
    this.setupRide(ride);
    this.ride = ride;

    if (!this.rideLocationRef) {
      const component = this;
      this.rideLocationRef = firebase
        .database()
        .ref("driver")
        .child(String(this.ride.driver_id))
        .child("location");
      this.rideLocationRef.on("value", function (data) {
        let rideLocation = data.val() as RideLocation;
        if (
          rideLocation &&
          rideLocation.current_latitude &&
          rideLocation.current_longitude
        ) {
          component.updateRideLocation(rideLocation);
        }
      });
    }
  }

  updateRideLocation(rl: RideLocation) {
    let centerRide = new google.maps.LatLng(
      Number(rl.current_latitude),
      Number(rl.current_longitude)
    );
    if (this.markerRide) {
      this.markerRide.setPosition(centerRide);
    } else {
      this.markerRide = new google.maps.Marker({
        position: centerRide,
        map: this.maps.map,
        title: "Ride is here!",
        icon: "assets/imgs/map_car_mini.png",
      });
    }
    setTimeout(() => {
      this.maps.map.panTo(centerRide);
    }, 750);
  }

  cancelSearch() {
    this.subscriptionExistingRides
      ? this.subscriptionExistingRides.unsubscribe()
      : undefined;
    if (this.timeoutVar) clearTimeout(this.timeoutVar);
    if (this.rideRef != null) this.rideRef.off("value");
    if (this.rideNewRef != null) this.rideNewRef.off("value");
    this.translate
      .get(["just_moment", "unable_find_ride"])
      .subscribe((values) => {
        this.cue.presentLoading(values["just_moment"]);
        this.clientService
          .rideCancel(
            window.localStorage.getItem(Constants.KEY_TOKEN),
            this.ride.id
          )
          .subscribe(
            (res) => {
              if (this.rideRef != null) this.rideRef.set(res);
              this.clearToPhase(2);
              this.cue.dismissLoading();
              this.cue.showToast(values["unable_find_ride"]);
            },
            (err) => {
              this.clearToPhase(1);
              console.log("cancel_err", err);
              this.cue.dismissLoading();
            }
          );
      });
  }

  setPaymentMethod(pm: string) {
    this.payment_method = pm;
    this.fabAction = false;
  }

  togglePaymentFab() {
    this.fabAction = !this.fabAction;
  }

  callRider() {
    this.callNumber
      .callNumber(this.ride.driver.user.mobile_number, true)
      .then((res) => console.log("Launched dialer!", res))
      .catch((err) => console.log("Error launching dialer", err));
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
              handler: () => {
                this.translate
                  .get(["just_moment", "request_fail"])
                  .subscribe((values) => {
                    this.cue.presentLoading(values["just_moment"]);
                    this.subscriptions.push(
                      this.clientService
                        .rideCancel(
                          window.localStorage.getItem(Constants.KEY_TOKEN),
                          this.ride.id
                        )
                        .subscribe(
                          (res) => {
                            this.cue.dismissLoading();
                            this.rideRef.set(res);
                            this.clearToPhase(1);
                          },
                          (err) => {
                            console.log("cancel_err", err);
                            this.cue.dismissLoading();
                            this.cue.presentErrorAlert(values["request_fail"]);
                          }
                        )
                    );
                  });
              },
            },
          ],
        });
        alert.present();
      });
  }

  toggleFab() {
    this.fabFooterAction = !this.fabFooterAction;
  }
  buyThisApp() {
    this.translate.get("opening_WhatsApp").subscribe((text) => {
      this.cue.presentLoading(text);
      this.clientService.getWhatsappDetails().subscribe(
        (res) => {
          this.cue.dismissLoading();
          return this.inAppBrowser.create(res["link"], "_system");
        },
        (err) => {
          console.log("Error rating:", JSON.stringify(err));
          this.cue.dismissLoading();
        }
      );
    });
  }

  navSavedAddress(pickFor) {
    this.searchingFor = pickFor;
    this.navCtrl.push("address", { pick: true });
  }

  updateRideStatus(status) {
    this.translate.get("just_moment").subscribe((value) => {
      this.cue.presentLoading(value);
      this.subscriptions.push(
        this.clientService
          .rideUpdate(
            window.localStorage.getItem(Constants.KEY_TOKEN),
            this.ride.id,
            status
          )
          .subscribe(
            (res) => {
              this.isAccept = true;
              this.cue.dismissLoading();
            },
            (err) => {
              console.log("cancel_err", err);
              this.cue.dismissLoading();
            }
          )
      );
    });
  }
}
