import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface ErrorTranslationsKey {
  key: string;
  error?: string;
  index?: number;
}

@Component({
  selector: 'fi-error-alert-list',
  templateUrl: './error-alert-list.component.html',
  styleUrls: ['./error-alert-list.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
})
export class ErrorAlertListComponent {
  @Input() title: string = 'R.CONTRACT.VALIDATION_ERRORS.LIST_LABEL';
  @Input() formErrorCollection: ErrorTranslationsKey[] = [];
}
