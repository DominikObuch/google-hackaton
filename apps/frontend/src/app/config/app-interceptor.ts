import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigProvider } from './config-provider';

export function appInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const configProvider = inject(ConfigProvider);
  const apiUrl = configProvider.apiUrl();

  if (req.url.startsWith('http') || req.url.startsWith('assets/')) {
    return next(req);
  }

  const cleanApiUrl = apiUrl.replace(/\/$/, '');
  let cleanReqUrl = req.url.replace(/^\//, '');

  if (cleanApiUrl.endsWith('/api') && cleanReqUrl.startsWith('api/')) {
    cleanReqUrl = cleanReqUrl.substring(4);
  }

  const newReq = req.clone({
    url: `${cleanApiUrl}/${cleanReqUrl}`,
  });
  return next(newReq);
}
