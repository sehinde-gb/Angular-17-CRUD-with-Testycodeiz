import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoadingService {
  private activeRequests = signal<number>(0);
  isLoading = computed(() => this.activeRequests() > 0);

  show() { this.activeRequests.update(v => v +1);}
  hide() { this.activeRequests.update(v => Math.max(0, v - 1));}
  
  constructor() { }
}
