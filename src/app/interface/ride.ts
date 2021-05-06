import { SpicaClient, SpicaResource } from "../services/spica.facade";
import { User } from "../interface/user"
import { PaymentMethod } from "../interface/payment_method"

export interface Coupon {
  _id?: string;
  code?: string;
  reward?: number;
  type?: string;
  data?: string;
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface Ride {
  _id?: string;
  is_scheduled?: number;
  status?: string;
  payment_status?: string;
  address_from?: string;
  address_to?: string;
  longitude_from?: number;
  latitude_from?: number;
  longitude_to?: number;
  latitude_to?: number;
  ride_start_at?: Date;
  ride_ends_at?: Date;
  ride_on?: Date;
  estimated_pickup_distance?: number;
  estimated_pickup_time?: number;
  estimated_distance?: number;
  final_distance?: number;
  estimated_fare?: number;
  estimated_time?: number;
  final_time?: number;
  final_fare?: number;
  created_at?: Date;
  updated_at?: Date;
  discount?: number;
  estimated_discount?: number;
  payment_method?: string | PaymentMethod;
  vehicle_type?: string;
  user?: string | User;
  coupon?: string | Coupon;
  driver?: string;
}

export class RideResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
