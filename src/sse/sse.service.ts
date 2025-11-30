import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class SseService {
  private events$ = new Subject<MessageEvent>();
  private userStreams = new Map<number, Subject<MessageEvent>>();

  private getUserStream(userId: number) {
    if (!this.userStreams.has(userId)) {
      this.userStreams.set(userId, new Subject<MessageEvent>());
    }

    return this.userStreams.get(userId)!;
  }

  connectUser(userId: number): Observable<MessageEvent> {
    return this.getUserStream(userId).asObservable();
  }

  get stream(): Observable<MessageEvent> {
    return this.events$.asObservable();
  }

  emitToUser(userId: number, data: any) {
    const stream = this.userStreams.get(userId);
    if (stream) {
      stream.next({ data });
    }
  }
}
