import { Directive, Input, OnChanges } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[fiDisableControl]'
})
export class DisableControlDirective implements OnChanges {

  disabled = false;

  constructor(private readonly ngControl: NgControl) {}
  
  @Input('fiDisableControl') set disableControl(disable: boolean) {
    this.disabled = disable;
  }
  
  ngOnChanges() {
    if(this.disabled) {
      this.ngControl.control.disable();
    } else {
      this.ngControl.control.enable();
    }
  }

}
