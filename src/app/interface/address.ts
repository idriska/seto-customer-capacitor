import { SpicaClient, SpicaResource } from "../services/spica.facade";
import { User } from './user';

export interface Address {
  _id?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  title?: string;
  created_at?: Date;
  updated_at?: Date;
  user?: string | User
}

export class AddressResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
