import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fi-alert',
  templateUrl: './alert.component.html',
})
export class AlertComponent implements OnInit {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() type = 'info';
  @Input() closable = true;
  @Input() id: number;
  @Input() transactionNumbers: number[] = [];
  @Input() customClass: string = '';

  @Input() open = true;
  @Output() openChange = new EventEmitter<boolean>();

  @Input() classAlert: string;
  iconClass: string;

  ngOnInit(): void {
    this.setAlertClass(this.type);
  }

  setAlertClass(type: string): void {
    switch (type) {
      case 'warning': {
        this.classAlert = 'c-alert--warning';
        this.iconClass = 'fas fa-exclamation-triangle c-alert--warning__icon ';
        break;
      }
      case 'error': {
        this.classAlert = 'c-alert--error';
        this.iconClass = 'fas fa-ban';
        break;
      }
      case 'success': {
        this.classAlert = 'c-alert--success';
        this.iconClass = 'fas fa-check-circle';
        break;
      }
      case 'info':
      default: {
        this.classAlert = 'c-alert--info';
        this.iconClass = 'fas fa-info-circle';
        break;
      }
    }
  }

  hide(): void {
    this.open = false;
    this.openChange.emit(this.open);
  }
}
