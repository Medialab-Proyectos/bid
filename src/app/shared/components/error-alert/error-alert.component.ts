import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'fi-error-alert',
  templateUrl: './error-alert.component.html',
  styleUrls: ['./error-alert.component.scss'],
  standalone: true,
  imports: [MatIconModule, CommonModule],
})
export class ErrorAlertComponent {
  @Input() description?: string = 'error test';
  @Input() title: string = 'Error';
}
