import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'fi-options-menu',
  templateUrl: './options-menu.component.html',
})
export class OptionsMenuComponent {
  @Input() options: string[] = [];
  @Output() optionClick = new EventEmitter<string>();

  @Input() anchor: any;
  @Input() closeOnClick = true;
  @ViewChild('popup', { read: ElementRef }) public popup: ElementRef;

  @Input() translate = false;

  public expandedOptions = false;

  @HostListener('document:click', ['$event'])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.close();
    }
  }
  public toggle(): void {
    this.expandedOptions = !this.expandedOptions;
  }

  close() {
    this.expandedOptions = false;
  }

  private contains(target: any): boolean {
    return (
      this.anchor.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }

  onOptionClick(option: string) {
    this.optionClick.emit(option);
    if (this.closeOnClick) {
      this.close();
    }
  }
}
