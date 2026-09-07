import { Injectable } from '@angular/core';
import { DelayedMilestoneEmitter } from '@core/models';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DelayedMilestoneEventBusService {
  private _selectedOption = new BehaviorSubject<DelayedMilestoneEmitter>(null);
  readonly selectedOption$ = this._selectedOption.asObservable();

  set selectedOption(event: DelayedMilestoneEmitter) {
    this._selectedOption.next(event);
  }

  get selectedOption() {
    return this._selectedOption.getValue();
  }

  constructor() {}
}
