import { SpicaClient, SpicaResource } from '../services/spica.facade';

export interface User {
  _id?: string;
  mobile_verified?: number;
  active?: number;
  confirmed?: number;
  language?: string;
  name?: string;
  email?: string;
  password?: string;
  image?: string;
  mobile_number?: string;
  confirmation_code?: string;
  fcm_registration_id?: string;
  refer_code?: string;
  remember_token?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  fcm_registration_id_driver?: string;
  stripe_customer_id?: string;
  role?: string;
  identity_id?: string;
}


export class UserResource extends SpicaResource {

  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient)
  }
}