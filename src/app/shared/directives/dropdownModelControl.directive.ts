import { Directive, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[fiDropdownModelControl]',
})
export class DirectiveDropdownModelControl implements OnDestroy {
  constructor(
    private readonly renderer: Renderer2,
    private readonly el: ElementRef,
    private readonly control: NgModel,
    private readonly translate: TranslateService
  ) {}

  private readonly subscriptions = new Subscription();
  domElement: any;

  ngOnInit() {
    const transalteCommon = this.translate.instant('COMMON.SELECT_AN_OPTION');
    this.domElement = this.el.nativeElement;
    const newStyles = {
      '--placeholder': `"${transalteCommon}"`,
    };
    Object.keys(newStyles).forEach((element) => {
      this.domElement.style.setProperty(`${element}`, newStyles[element]);
    });
    const valueModel = this.control as NgModel;

    this.validate(this.checkValidation(valueModel.model));

    this.subscriptions.add(
      valueModel.valueChanges.subscribe((data) => {
        this.validate(this.checkValidation(data));
      })
    );
  }

  checkValidation(value: any): boolean {
    return value === undefined || value === null || value === '';
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
