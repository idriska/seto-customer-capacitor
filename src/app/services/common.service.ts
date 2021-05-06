import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

/*
  Generated class for the LanguageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CommonService {
  constructor(public http: HttpClient) {}

  async getDistanceAndTime(locationSource, locationDestination) {
    let locFrom = locationSource;
    let locTo = locationDestination;

    var distance = 0;
    var time = 0;

    const matrix = new google.maps.DistanceMatrixService();

    let myPromise = new Promise(function (resolve, reject) {
      matrix.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(locFrom.lat, locFrom.lng)],
          destinations: [new google.maps.LatLng(locTo.lat, locTo.lng)],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        function (response, status) {
          if (status == "OK") {
            resolve(response);
          } else {
            reject("Error");
          }
        }
      );
    });

    await myPromise
      .then((response) => {
        distance = response["rows"][0].elements[0].distance.value / 1000;
        time = response["rows"][0].elements[0].duration.value / 60;
      })
      .catch((err) => {return err});

    
    return [distance, time];
  }
}
