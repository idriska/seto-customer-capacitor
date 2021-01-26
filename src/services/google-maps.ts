import { Injectable, Inject } from '@angular/core';
import { Connectivity } from './connectivity-service';
import { APP_CONFIG, AppConfig } from '../app/app.config';
import { MyLocation } from '../models/my-location.models';

declare var google

@Injectable()
export class GoogleMaps {
  mapElement: any;
  pleaseConnect: any;
  map: any;
  mapInitialised: boolean = false;
  mapLoaded: any;
  mapLoadedObserver: any;
  currentMarker: any;
  myCenter: MyLocation;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, public connectivityService: Connectivity) {

  }

  init(mapElement: any, pleaseConnect: any, myCenter: MyLocation): Promise<any> {
    this.mapElement = mapElement;
    this.pleaseConnect = pleaseConnect;
    this.myCenter = myCenter;
    return this.loadGoogleMaps();
  }

  loadGoogleMaps(): Promise<any> {
    return new Promise((resolve) => {
      if (typeof google == "undefined" || typeof google.maps == "undefined") {
        console.log("Google maps JavaScript needs to be loaded.");
        this.disableMap();
        if (this.connectivityService.isOnline()) {
          window['mapInit'] = () => {
            this.initMap().then(() => {
              resolve(true);
            });
            this.enableMap();
          }
          let script = document.createElement("script");
          script.id = "googleMaps";
          if (this.config.googleApiKey) {
            script.src = 'http://maps.google.com/maps/api/js?key=' + this.config.googleApiKey + '&callback=mapInit&libraries=places';
          } else {
            script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
          }
          document.body.appendChild(script);
        }
      } else {
        if (this.connectivityService.isOnline()) {
          this.initMap();
          this.enableMap();
        }
        else {
          this.disableMap();
        }
        resolve(true);
      }
      this.addConnectivityListeners();
    });
  }

  initMap(): Promise<any> {
    this.mapInitialised = true;
    return new Promise((resolve) => {
      let styles: Array<google.maps.MapTypeStyle> = [
        {
          "featureType": "administrative.land_parcel",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.neighborhood",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.business",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.local",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        }
      ];
      // [
      //   {
      //     "featureType": "poi",
      //     stylers: [{ visibility: "off" }]
      //     // "elementType": "geometry",
      //     // "stylers": [
      //     //   {
      //     //     "color": "#eeeeee"
      //     //   }
      //     // ]
      //   },
      //   {
      //     "featureType": "poi",
      //     stylers: [{ visibility: "off" }]
      //     // "elementType": "labels.text.fill",
      //     // "stylers": [
      //     //   {
      //     //     "color": "#757575"
      //     //   }
      //     // ]
      //   },
      //   {
      //     "featureType": "poi.park",
      //     stylers: [{ visibility: "off" }]
      //     // "elementType": "geometry",
      //     // "stylers": [
      //     //   {
      //     //     "color": "#e5e5e5"
      //     //   }
      //     // ]
      //   },
      //   {
      //     "featureType": "poi.park",
      //     stylers: [{ visibility: "off" }]
      //     // "elementType": "labels.text.fill",
      //     // "stylers": [
      //     //   {
      //     //     "color": "#9e9e9e"
      //     //   }
      //     // ]
      //   }
      // ];
      let center = new google.maps.LatLng(this.myCenter ? Number(this.myCenter.lat) : 47.5162, this.myCenter ? Number(this.myCenter.lng) : 14.5501);
      let mapOptions = {
        center: center,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        //styles: styles,
        disableDefaultUI: true,
        minZoom: 3, maxZoom: 15
      }
      this.map = new google.maps.Map(this.mapElement, mapOptions);
      resolve(true);
    });
  }

  disableMap(): void {
    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "block";
    }
  }

  enableMap(): void {
    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "none";
    }
  }

  addConnectivityListeners(): void {
    this.connectivityService.watchOnline().subscribe(() => {
      setTimeout(() => {
        if (typeof google == "undefined" || typeof google.maps == "undefined") {
          this.loadGoogleMaps();
        }
        else {
          if (!this.mapInitialised) {
            this.initMap();
          }
          this.enableMap();
        }
      }, 2000);
    });
    this.connectivityService.watchOffline().subscribe(() => {
      this.disableMap();
    });

  }

}
