import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';

import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/throttle';
import 'rxjs/add/operator/merge';
import { Observable } from 'rxjs/Observable';

/**
 * Inactivity directive
 */
@Directive({
  selector: '[ngxInactivity]'
})
export class NgxInactivityDirective {

  /**
   * Mouse move event emitter
   */
  private mousemove = new EventEmitter();

  /**
   * Wheel move event emitter
   */
  private wheelmove = new EventEmitter();

  /**
   * Mouse down event emitter
   */
  private mousedown = new EventEmitter();

  /**
   * Keypress event emitter
   */
  private keypress = new EventEmitter();

  /**
   * SetTimeout method id
   */
  private timeoutId: any;

  /**
   * Inactivity timeout limit (defaults 15 minutes)
   */
  @Input() ngxInactivity: number = 15;

  /**
   * Inactivity interval (defaults 1000 ms)
   */
  @Input() ngxInactivityInterval: number = 1000;

  /**
   * List of events that will be disabled
   */
  @Input() disabledEvents: string[] = [];

  /**
   * Inactivity callback after timeout
   */
  @Output() ngxInactivityCallback = new EventEmitter();

  /**
   * Attach a mouse move listener
   */
  @HostListener('document:wheel', ['$event'])
  onWheelmove(event) {
    if (!this.isEventDisabled('wheel')) {
      this.wheelmove.emit(event);
    }
  }

  /**
   * Attach a mouse move (and touch move) listener(s)
   */
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onMousemove(event) {
    if (!this.isEventDisabled('mousemove') && !this.isEventDisabled('touchmove')) {
      this.mousemove.emit(event);
    }
  }

  /**
   * Attach a mouse down (and touch end) listener(s)
   */
  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:touchend', ['$event'])
  onMousedown(event) {
    if (!this.isEventDisabled('mousedown') && !this.isEventDisabled('touchend')) {
      this.mousedown.emit(event);
    }
  }

  /**
   * Attach a key press listener
   */
  @HostListener('document:keypress', ['$event'])
  onKeypress(event) {
    if (!this.isEventDisabled('keypress')) {
      this.keypress.emit(event);
    }
  }

  constructor() {
    /*
     * Merge to flattens multiple Observables together
     * by blending their values into one Observable
     */
    this.mousemove.merge(this.wheelmove, this.mousedown, this.keypress)
      /*
       * Debounce to emits a value from the source Observable
       * only after a particular time span
       */
      .throttle(() => Observable.interval(this.ngxInactivityInterval))
      /*
       * Subscribe to handle emitted values
       */
      .subscribe(() => {
        this.reset();
        this.start();
      });
  }

  /**
   * Start inactivity timer
   */
  public start(): void {
    /**
     * Inactivity callback if timeout (in minutes) is exceeded
     */
    this.timeoutId = setTimeout(() => this.ngxInactivityCallback.emit(true), this.ngxInactivity * 60000);
  }

  /**
   * Reset inactivity timer
   */
  public reset(): void {
    clearTimeout(this.timeoutId);
  }

  /**
  * Check if the underyling event is disabled or not
  */
  public isEventDisabled(eventType: string): boolean {
    /**
     * Convert all strings to the lower case before comparing
     */
    this.disabledEvents.forEach((v, i) => this.disabledEvents[i] = v.toLowerCase());
    return this.disabledEvents.includes(eventType.toLowerCase());
  }
}
