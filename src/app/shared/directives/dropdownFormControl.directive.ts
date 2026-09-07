import { Directive, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[fiDropdownFormControl]',
})
export class DirectiveDropdownFormControl implements OnDestroy {
  constructor(
    private readonly renderer: Renderer2,
    private readonly el: ElementRef,
    private readonly control: NgControl,
    private readonly translate: TranslateService
  ) {}

  private readonly subscriptions = new Subscription();
  domElement: any;

  ngOnInit() {
    const translateCommon = this.translate.instant('COMMON.SELECT_AN_OPTION');
    this.domElement = this.el.nativeElement;
    const newStyles = {
      '--placeholder': `"${translateCommon}"`,
    };
    Object.keys(newStyles).forEach((element) => {
      this.domElement.style.setProperty(`${element}`, newStyles[element]);
    });
    const valueFormControl = this.control.control as FormControl;

    this.validate(this.checkValidation(valueFormControl.value));

    this.subscriptions.add(
      valueFormControl.valueChanges.subscribe((data) => {
        this.validate(this.checkValidation(data));
      })
    );
  }

  checkValidation(value: any): boolean {
    const searchBidder = { searchName: '' };
    return (
      value === undefined ||
      value === null ||
      value === '' ||
      JSON.stringify(value) === JSON.stringify(searchBidder)
    );
  }

  validate(condition: boolean) {
    if (condition) {
      this.renderer.addClass(this.el.nativeElement, 'empty');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'empty');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
