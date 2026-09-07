import { Component, Input, OnInit } from '@angular/core';
import { ProcurementComment } from '../../models';

@Component({
  selector: 'fi-completed-comments',
  templateUrl: './completed-comments.component.html',
  styleUrls: [],
})
export class CompletedCommentsComponent implements OnInit {
  @Input() comments: ProcurementComment[] = [];
  @Input() noCommentsKey: string = 'COMMENTS.NO_CONTENT';
  timezoneOffset = new Date().getTimezoneOffset() / 60;
  timeDiffBetweenLocaleAndUTC = '';
  ngOnInit(): void {
    if (this.timezoneOffset > 0) {
      this.timeDiffBetweenLocaleAndUTC = `UTC-${this.timezoneOffset * 2}`;
    } else {
      this.timeDiffBetweenLocaleAndUTC = `UTC+${this.timezoneOffset * -2}`;
    }
  }
}
