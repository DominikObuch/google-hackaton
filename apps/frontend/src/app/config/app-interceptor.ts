import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigProvider } from './config-provider';

export function appInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const configProvider = inject(ConfigProvider);
  const apiUrl = configProvider.apiUrl();

  const newReq = req.clone({
    url: `${apiUrl}/${req.url}`,
  });
  return next(newReq);
}
