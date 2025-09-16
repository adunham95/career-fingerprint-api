import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthCookieService {
  setAuthCookie(response: Response, accessToken: string, sessionID?: string) {
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      domain: process.env.COOKIE_DOMAIN,
    });
    if (sessionID) {
      response.cookie('sessionAccessToken', sessionID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        domain: process.env.COOKIE_DOMAIN,
      });
    }
  }

  clearAuthCookie(response: Response) {
    response.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.COOKIE_DOMAIN,
      maxAge: -1,
    });
    response.clearCookie('sessionAccessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.COOKIE_DOMAIN,
      maxAge: -1,
    });
  }
}
