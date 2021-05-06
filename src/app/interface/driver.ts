import { SpicaClient, SpicaResource } from "../services/spica.facade";
import { User } from "./user"

export interface DriverLicence {
  licence_expiry_month?: string;
  licence_expiry_year?: string;
  licence_number?: string;
}

export interface DriverPayout {
  bank_number?: string;
  bic_swift?: string;
  recipient_name?: string;
}

export interface DriverBilling {
  company_address?: string;
  company_mail?: string;
  company_name?: string;
  company_reg?: string;
}

export interface Meta {
  driver_licence?: DriverLicence;
  driver_payout?: DriverPayout;
  driver_billing?: DriverBilling;
}

export interface Driver {
  _id?: string;
  vehicle_type?: string;
  is_verified?: number;
  is_online?: number;
  is_riding?: number;
  current_latitude?: number;
  current_longitude?: number;
  created_at?: Date;
  updated_at?: Date;
  user?: string | User;
  car?: string;
  taxi_number?: string;
  meta?: Meta;
  document?: string;
  license?: string;
}

export class DriverResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
