import { Injectable } from "@angular/core";
import { SpicaClient } from "./spica.facade";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SpicaFunctionService {
  private spicaClient = "https://test-4061d.hq.spicaengine.com/api"
  constructor(private http: HttpClient) {}


  // calculateFare(locationSource, locationDestination){
  //   let locFrom = locationSource;
  //   let locTo = locationDestination;
    
  //   let urlParams = new URLSearchParams();
  //   urlParams.append("latitude_from", locFrom.lat);
  //   urlParams.append("longitude_from", locFrom.lng);
  //   urlParams.append("latitude_to", locTo.lat);
  //   urlParams.append("longitude_to", locTo.lng);

  //   return this.http
  //     .get(`${this.spicaClient}/fn-execute/seto_calculate_fare?${urlParams.toString()}`)
  //     .toPromise();
  // }
}
