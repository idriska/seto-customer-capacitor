import { Injectable } from '@angular/core';
import { SpicaClient } from './spica.facade';
import { DriverResource } from '../interface/driver';
import { RideResource } from '../interface/ride';
import { UserResource } from '../interface/user';
import { RideRequestResource } from '../interface/ride_request';
import { FaqResource } from '../interface/faq';
import { SupportResource } from '../interface/support';
import { RatingResource } from '../interface/rating';
import { VehicleTypeResource } from '../interface/vehicle_type';
import { SettingResource } from '../interface/setting';
import { PaymentMethodResource } from '../interface/payment_method';
import { AddressResource } from '../interface/address';
import { CouponResource } from '../interface/coupon';
import { CardResource } from '../interface/card';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  private spicaClient = new SpicaClient("https://test-4061d.hq.spicaengine.com/api");
  public resources = {
    users: new UserResource("5fe059c3bf26e5002c60cb14", this.spicaClient),
    rides: new RideResource("5fe44b3bdfdd0f002c91efc9", this.spicaClient),
    drivers: new DriverResource("5fe33e95dfdd0f002c91ef0d", this.spicaClient),
    rideRequest: new RideRequestResource("5fe46231dfdd0f002c91f044", this.spicaClient),
    faqs: new FaqResource("5fe5ac91dfdd0f002c91f2d5", this.spicaClient),
    supports: new SupportResource("5fe5ab41dfdd0f002c91f2d0", this.spicaClient),
    ratings: new RatingResource("5fe5d834dfdd0f002c91f319", this.spicaClient),
    vehicleTypes: new VehicleTypeResource ("5fe30ea1dfdd0f002c91eed3", this.spicaClient),
    settings: new SettingResource ("5fe34fccdfdd0f002c91ef1e", this.spicaClient),
    paymentMethods: new PaymentMethodResource ("5fe44b94dfdd0f002c91efcb", this.spicaClient),
    addresses: new AddressResource ("5fe20275dfdd0f002c91ede2", this.spicaClient),
    coupons: new CouponResource ("5fe5af73dfdd0f002c91f2da", this.spicaClient),
    cards: new CardResource ("5fe1f455dfdd0f002c91eda5", this.spicaClient),
  }
  constructor() { 
  }
}
