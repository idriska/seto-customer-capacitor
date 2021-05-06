import { SpicaClient, SpicaResource } from "../services/spica.facade";

export interface Setting {
  _id?: string;
  key?: string;
  value?: string;
}

export class SettingResource extends SpicaResource {
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    super(resourceBucketId, spicaClient);
  }
}
