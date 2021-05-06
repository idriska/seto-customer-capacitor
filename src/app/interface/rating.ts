import { SpicaClient, SpicaResource } from "../services/spica.facade";

export interface Rating {
  _id?: string;
  rating?: number;
  review?: string;
  created_at?: Date;
  updated_at?: Date;
  rating_to?: string;
  rating_from?: string;
  ride?: string;
}

export class RatingResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
