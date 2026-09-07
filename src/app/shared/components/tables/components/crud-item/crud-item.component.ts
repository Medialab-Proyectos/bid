import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { Action } from '@core/enums';
import { ItemAction } from '@core/models';
import { Align, Offset } from '@progress/kendo-angular-popup';

@Component({
  selector: 'fi-crud-item',
  templateUrl: './crud-item.component.html',
  styleUrls: ['./crud-item.component.scss'],
})
export class CrudItemComponent {
  @Input() itemID: string;
  @Output() actionitemID: EventEmitter<ItemAction> =
    new EventEmitter<ItemAction>();
  @ViewChild('anchor') public anchor: ElementRef;
  @ViewChild('popup', { read: ElementRef }) public popup: ElementRef;
  public show = false;
  public offset: Offset = { left: 0, top: 0 };
  public anchorAlign: Align = { horizontal: 'right', vertical: 'bottom' };
  public popupAlign: Align = { horizontal: 'right', vertical: 'top' };
  public margin = { horizontal: -25, vertical: 0 };
  public expandedOptions = false;
  public onToggle(): void {
    this.show = !this.show;
  }

  @HostListener('document:click', ['$event'])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.expandedOptions = false;
    }
  }
  public toggle(): void {
    this.expandedOptions = !this.expandedOptions;
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }
  emitActionItem(action: string) {
    const actionObj: ItemAction = {
      id: this.itemID,
      action: Action[action],
    };
    this.actionitemID.emit(actionObj);
  }
}
