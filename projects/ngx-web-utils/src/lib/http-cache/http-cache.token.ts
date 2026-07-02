import { HttpContextToken } from '@angular/common/http';

export const HTTP_CACHE_TTL_TOKEN = new HttpContextToken<number>(() => 0);
export const HTTP_CACHE_OVERWRITE_TOKEN = new HttpContextToken<boolean>(() => false);

export const HTTP_CACHE_TAGS_TOKEN = new HttpContextToken<string[]>(() => []);
export const HTTP_CACHE_GROUP_TOKEN = new HttpContextToken<string>(() => '');
export const HTTP_CACHE_ID_TOKEN = new HttpContextToken<string>(() => '');
