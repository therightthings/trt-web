import { HttpResponse } from '@angular/common/http';

export interface HttpCacheState {
  response: HttpResponse<any>;
  createdTime: number;
  ttl: number;
  tags?: string[];
  group?: string;
  id?: string;
}

export interface HttpCacheConfig {
  ttl: number;
  debug: boolean;
}
