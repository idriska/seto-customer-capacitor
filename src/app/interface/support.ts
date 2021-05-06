import { SpicaClient, SpicaResource } from "../services/spica.facade";

export interface Support {
  _id?: string;
  name?: string;
  email?: string;
  message?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class SupportResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
