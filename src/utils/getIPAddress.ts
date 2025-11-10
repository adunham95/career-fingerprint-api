import { Request } from 'express';

export function getClientIp(req: Request): string {
  const xfwd = req.headers['x-forwarded-for'];

  if (Array.isArray(xfwd)) {
    return xfwd[0]; // take first element
  }

  if (typeof xfwd === 'string') {
    return xfwd.split(',')[0].trim(); // first IP in list
  }

  return req.socket.remoteAddress || '';
}
