import { SpicaClient, SpicaResource } from "../services/spica.facade";

export interface VehicleType {
  _id?: string;
  title?: string;
  base_fare?: number;
  distance_charges_per_unit?: number;
  time_charges_per_minute?: number;
  other_charges?: number;
  seats?: number;
  created_at?: Date;
  updated_at?: Date;
  image?: string;
}

export class VehicleTypeResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
