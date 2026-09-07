import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Enumerator } from '@core/models';
import { AppStateWithCommentsFilter } from '@core/store/commentsFilter/reducer/commentsFilter.reducer';
import { ProcurementComment } from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-procurement-process-completed-comments',
  templateUrl: './procurement-process-completed-comments.component.html',
})
export class ProcurementProcessCompletedCommentsComponent
  implements OnInit, OnDestroy
{
  @Input() comments: ProcurementComment[] = [];
  @Input() noCommentsKey: string = 'COMMENTS.NO_CONTENT';
  @Input() commentVisibilitiesEnum: Enumerator[];
  sub: Subscription = new Subscription();

  timezoneOffset = new Date().getTimezoneOffset() / 60;
  timeDiffBetweenLocaleAndUTC = '';
  showVersions = true;

  constructor(readonly store: Store<AppStateWithCommentsFilter>) {}
  ngOnInit(): void {
    if (this.timezoneOffset > 0) {
      this.timeDiffBetweenLocaleAndUTC = `UTC-${this.timezoneOffset * 2}`;
    } else {
      this.timeDiffBetweenLocaleAndUTC = `UTC+${this.timezoneOffset * -2}`;
    }
    this.sub.add(
      this.store.select('commentsFilterForm').subscribe((data) => {
        this.showVersions = data.form.activeVersion;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
