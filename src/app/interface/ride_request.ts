import { SpicaClient, SpicaResource } from "../services/spica.facade";
import { Driver } from "../interface/driver";

export interface RideRequest {
  _id?: string;
  status?: string;
  ride?: string;
  created_at?: Date;
  updated_at?: Date;
  driver?: string | Driver; 
}

export class RideRequestResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
