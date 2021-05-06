import { SpicaClient, SpicaResource } from "../services/spica.facade";

export interface PaymentMethod {
  _id?: string;
  slug?: string;
  title?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class PaymentMethodResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
