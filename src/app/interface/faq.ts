import { SpicaClient, SpicaResource } from "../services/spica.facade";

export interface Faq {
  _id?: string;
  title?: string;
  short_description?: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class FaqResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
