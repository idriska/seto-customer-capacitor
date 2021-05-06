import { HttpClient } from "@angular/common/http";
import * as Bucket from '@spica-devkit/bucket';
import { BucketDocument } from '@spica-devkit/bucket';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export class SpicaClient {
  apiUrl: string;
  constructor(api: string) {
    this.apiUrl = api;
  }
}

export class SpicaResource {
  private resourceBucketId: string;
  constructor(resourceBucketId: string, public spicaClient: SpicaClient) {
    this.resourceBucketId = resourceBucketId;
  }

  private init() {
    let initializeConfig;
    if (localStorage.getItem('spica_token')) {
      initializeConfig = {
        publicUrl: this.spicaClient.apiUrl,
        identity: localStorage.getItem('spica_token'),
      };
    } else {
      initializeConfig = {
        publicUrl: this.spicaClient.apiUrl,
        apikey: environment.visitorApiKey,
      };
    }
    Bucket.initialize(initializeConfig);
  }

  post(data) {
    this.init();
    data = this.normalizeData(data);
    return from(Bucket.data.insert(this.resourceBucketId, data));
  }

  get(
    documentId: string,
    options?: { headers?: {}; queryParams?: {} }
  ): Observable<BucketDocument> {
    this.init();
    return from(
      Bucket.data.get(this.resourceBucketId, documentId, options)
    ) as Observable<BucketDocument>;
  }

  getAll(options?: {
    headers?: {};
    queryParams?: {};
  }): Observable<BucketDocument[]> {
    this.init();
    return from(
      Bucket.data.getAll(this.resourceBucketId, options)
    ) as Observable<BucketDocument[]>;
  }

  update(documentId: string, data) {
    this.init();
    data = this.normalizeData(data);
    return from(Bucket.data.update(this.resourceBucketId, documentId, data));
  }

  remove(documentId: string) {
    this.init();
    return from(Bucket.data.remove(this.resourceBucketId, documentId));
  }

  patch(documentId: string, data) {
    this.init();
    data = this.normalizeData(data);
    return from(Bucket.data.patch(this.resourceBucketId, documentId, data));
  }

  getRealtime(documentId: string):any {
    this.init();
    return Bucket.data.realtime.get(this.resourceBucketId, documentId);
  }

  getAllRealtime(queryParams?: {}) {
    this.init();
    return Bucket.data.realtime.getAll(this.resourceBucketId, queryParams);
  }

  private normalizeData(data) {
    Object.entries(data).forEach(([field, value]) => {
      if (data[field] && data[field][0] && data[field][0]._id) {
        data[field] = data[field].map((item) => item._id);
      }
    });
    return data;
  }
}
