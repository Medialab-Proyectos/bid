import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'fi-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  public titleToast: string;
  public detailToast: string[] = [];
  @Output() public closeToast: EventEmitter<boolean> = new EventEmitter();

  public close(event: Event): void {
    event.preventDefault();
    this.closeToast.emit(true);
  }
}
