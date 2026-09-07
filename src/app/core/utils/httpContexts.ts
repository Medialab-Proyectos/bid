import { HttpContextToken } from '@angular/common/http';

export const REQUEST_IS_ENCODED = new HttpContextToken<boolean>(() => true);
export const SHOULD_CACHE_REQUEST = new HttpContextToken<boolean>(() => false);
