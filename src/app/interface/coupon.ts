import { SpicaClient, SpicaResource } from "../services/spica.facade";

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

export class CouponResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
