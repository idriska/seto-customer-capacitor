import { Component, ViewChild, ElementRef, NgZone } from "@angular/core";
import { ModalController, ToastController } from "@ionic/angular";
import { Address_titlePage } from "../address_title/address_title";
import { MyLocation } from "../../models/my-location.models";
import { Subscription } from "rxjs";
import { GoogleMaps } from "../../services/google-maps";
import { ClientService } from "../../services/client.service";
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "../../models/constants.models";
import { CommonUiElement } from "../../services/app.commonelements";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { RouterWrapperService } from "src/app/services/router-wrapper.service";
import { DataService } from "src/app/services/data.service";
import { Address } from "src/app/interface/address";
import { User } from 'src/app/interface/user';

@Component({
  selector: "page-add_address",
  templateUrl: "add_address.html",
  providers: [CommonUiElement, ClientService],
  styleUrls: ["add_address.scss"],
})
export class Add_addressPage {
  @ViewChild("map") private mapElement: ElementRef;
  @ViewChild("pleaseConnect") private pleaseConnect: ElementRef;
  private latitude: number;
  private longitude: number;
  private autocompleteService: any;
  private placesService: any;
  private query: string = "";
  private places: any = [];
  private searchDisabled: boolean;
  private saveDisabled: boolean;
  private initialized: boolean;
  private location: MyLocation;
  private marker: google.maps.Marker;
  private address: Address = {};
  private subscriptions: Array<Subscription> = [];
  private modalPresented = false;
  private forfoodsearch = false;
  private addressSaveModal;
  private user: User;

  constructor(
    private navCtrl: RouterWrapperService,
    private zone: NgZone,
    private maps: GoogleMaps,
    private modalCtrl: ModalController,
    private geolocation: Geolocation,
    private toastCtrl: ToastController,
    private global: CommonUiElement,
    private service: ClientService,
    private translate: TranslateService,
    private dataService: DataService
  ) {
    // this.menuCtrl.enable(false, 'myMenu');
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.searchDisabled = true;
    this.saveDisabled = true;

    this.address = this.navCtrl.getData("address");
    this.forfoodsearch = this.navCtrl.getData("forfoodsearch");

    // this.address = navparam.get("address");
    // this.forfoodsearch = navparam.get("forfoodsearch");
  }

  ionViewWillLeave() {
    if (this.addressSaveModal) this.addressSaveModal.dismiss();
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  ionViewDidEnter(): void {
    if (!this.initialized) {
      let mapLoaded = this.maps
        .init(
          this.mapElement.nativeElement,
          this.pleaseConnect.nativeElement,
          JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION_SOURCE))
        )
        .then(() => {
          this.autocompleteService = new google.maps.places.AutocompleteService();
          this.placesService = new google.maps.places.PlacesService(
            this.maps.map
          );
          this.searchDisabled = false;
          this.maps.map.addListener("click", (event) => {
            if (event && event.latLng) {
              this.onMapClick(
                new google.maps.LatLng(event.latLng.lat(), event.latLng.lng())
              );
            }
          });
          this.initialized = true;
          if (this.address) {
            this.onMapClick(
              new google.maps.LatLng(
                this.address.latitude,
                this.address.longitude
              )
            );
          } else {
            this.detect();
          }
        })
        .catch((err) => {
          console.log(err);
          this.close();
        });
      mapLoaded.catch((err) => {
        console.log(err);
        this.close();
      });
    }
  }

  onMapClick(pos: google.maps.LatLng) {
    if (pos) {
      if (!this.marker) {
        this.marker = new google.maps.Marker({
          position: pos,
          map: this.maps.map,
        });
        this.marker.setClickable(true);
        this.marker.addListener("click", (event) => {
          console.log("markerevent", event);
          this.showToast(this.location.name);
        });
      } else {
        this.marker.setPosition(pos);
      }
      this.maps.map.panTo(pos);

      let geocoder = new google.maps.Geocoder();
      let request = { location: pos };
      geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
          this.saveDisabled = false;
          this.location = new MyLocation();
          this.location.name = results[0].formatted_address;
          this.location.lat = String(pos.lat());
          this.location.lng = String(pos.lng());
          this.showToast(this.location.name);
        }
      });
    }
  }

  selectPlace(place) {
    this.query = place.description;
    this.places = [];
    let myLocation = new MyLocation();
    myLocation.name = place.name;
    this.placesService.getDetails({ placeId: place.place_id }, (details) => {
      // console.log("details", JSON.stringify(details));
      this.zone.run(() => {
        myLocation.name =
          details.formatted_address && details.formatted_address.length
            ? details.formatted_address
            : details.name;
        myLocation.lat = details.geometry.location.lat();
        myLocation.lng = details.geometry.location.lng();
        this.saveDisabled = false;
        let lc = { lat: myLocation.lat, lng: myLocation.lng };
        this.maps.map.setCenter(lc);
        this.location = myLocation;
        let pos = new google.maps.LatLng(Number(lc.lat), Number(lc.lng));
        if (!this.marker)
          this.marker = new google.maps.Marker({
            position: pos,
            map: this.maps.map,
          });
        else this.marker.setPosition(pos);
        this.maps.map.panTo(pos);
      });
    });
  }

  searchPlace(query) {
    this.saveDisabled = true;
    if (query.length > 0 && !this.searchDisabled) {
      let config = {
        input: query,
        componentRestrictions: { country: "TR" },
      };
      this.autocompleteService.getPlacePredictions(
        config,
        (predictions, status) => {
          if (
            status == google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            this.places = [];
            predictions.forEach((prediction) => {
              this.places.push(prediction);
            });
          }
        }
      );
    } else {
      this.places = [];
    }
  }

  detect() {
    this.geolocation
      .getCurrentPosition()
      .then((position) => {
        this.onMapClick(
          new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
        );
      })
      .catch((err) => {
        console.log("getCurrentPosition", err);
        this.showToast("Location detection failed");
      });
  }

  async save() {
    if (this.location) {
      window.localStorage.setItem(
        Constants.KEY_LOCATION,
        JSON.stringify(this.location)
      );
      if (this.forfoodsearch) {
        this.close();
      } else {
        if (!this.address) this.address = {};
        this.address.latitude = Number(this.location.lat);
        this.address.longitude = Number(this.location.lng);
        this.address.address = this.location.name;
        this.addressSaveModal = await this.modalCtrl.create({
          component: Address_titlePage,
          componentProps: { address: this.address },
          cssClass: "address_title",
        });
        this.addressSaveModal.present();
        this.addressSaveModal.onDidDismiss().then((data) => {
          this.modalPresented = false;
          this.address = data.data;
          this.saveAddress();
        });
        this.modalPresented = true;
      }
    }
  }

  saveAddress() {
    if (!this.address.title) {
      this.translate.get("address_title_err").subscribe((value) => {
        this.global.showToast(value);
      });
      // this.global.showToast("Please enter address title");
    } else if (!this.address.address) {
      this.translate.get("address_title_err1").subscribe((value) => {
        this.global.showToast(value);
      });
      // this.global.showToast("Please enter address");
    } else if (
      !(Number(this.address.latitude) && Number(this.address.longitude))
    ) {
      this.translate.get("address_latlng_err").subscribe((value) => {
        this.global.showToast(value);
      });
      // this.global.showToast("Please enter address");
    } else {
      this.address.user = this.user._id;
      this.translate.get("address_saving").subscribe((value) => {
        this.global.presentLoading(value);

        if (this.address && this.address._id) {
          this.dataService.resources.addresses
            .patch(this.address._id, this.address)
            .subscribe(
              (res) => this.done(res),
              (err) => this.failed(err)
            );
        } else
          this.dataService.resources.addresses.post(this.address).subscribe(
            (res) => this.done(res),
            (err) => this.failed(err)
          );

        // this.subscriptions.push(
        //   this.address && this.address._id
        //     ? this.service
        //         .updateAddress(this.address._id, this.address)
        //         .subscribe(
        //           (res) => this.done(res),
        //           (err) => this.failed(err)
        //         )
        //     : this.service.saveAddress(this.address).subscribe(
        //         (res) => this.done(res),
        //         (err) => this.failed(err)
        //       )
        // );
      });
    }
  }

  failed(err) {
    this.global.dismissLoading();
    console.log("address", err);
    this.close();
  }

  done(res) {
    window.localStorage.setItem(Constants.ADDRESS_EVENT, JSON.stringify(res));
    this.global.dismissLoading();
    this.close();
  }

  close() {
    this.navCtrl.pop();
  }

  async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: "bottom",
    });
    toast.present();
  }
}
