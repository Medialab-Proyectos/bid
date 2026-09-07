import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'fi-dropdownbutton',
  templateUrl: './dropdownbutton.component.html',
})
export class DropdownbuttonComponent {
  @Input() itemOptions: string[];
  @Input() id: number;
  @Input() disabled: boolean;

  @Output() selectedOption: EventEmitter<string> = new EventEmitter<string>();

  onItemClick(option: string): void {
    this.selectedOption.emit(option);
  }
}
