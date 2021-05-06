import { SpicaClient, SpicaResource } from "../services/spica.facade";

export interface Card {
  _id?: string;
  stripe_card_id?: string;
  number?: string;
  exp_month?: string;
  exp_year?: string;
  cvc?: string;
}

export class CardResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
