// error-focus.directive.ts
import { Directive, ElementRef, HostBinding, Renderer2 } from '@angular/core';

@Directive({
  selector: '[fiErrorFocus]',
})
export class ErrorFocusDirective {
  @HostBinding('attr.tabindex') tabindex = '-1';
  @HostBinding('class.error-focusable') errorClass = true;

  constructor(
    public elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  focus(): boolean {
    const element = this.elementRef.nativeElement;

    if (!this.isVisible(element)) {
      return false;
    }

    element.focus();
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    this.addTemporaryHighlight();
    return true;
  }

  static focusFirstErrorInDocument(): boolean {
    const selectors = [
      'mat-error[fierrorfocus]',
      'fi-error-alert[fierrorfocus]',
      'mat-error:not([style*="display: none"])',
      '.mat-mdc-form-field-error:not([style*="display: none"])',
      'fi-r-contract-error',
      '.error-focusable',
    ];

    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector)); // ✅ Convert to array

      for (const element of elements) {
        if (ErrorFocusDirective.isElementVisible(element as HTMLElement)) {
          ErrorFocusDirective.focusElement(element as HTMLElement);
          return true;
        }
      }
    }

    console.warn('❌ No visible errors found');
    return false;
  }

  private static focusElement(element: HTMLElement) {
    element.setAttribute('tabindex', '-1');
    element.focus();
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    element.classList.add('error-focused');
    setTimeout(() => {
      element.classList.remove('error-focused');
    }, 2000);
  }

  private static isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return !!(
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  private isVisible(element: HTMLElement): boolean {
    return ErrorFocusDirective.isElementVisible(element);
  }

  private addTemporaryHighlight() {
    const element = this.elementRef.nativeElement;
    this.renderer.addClass(element, 'error-focused');

    setTimeout(() => {
      this.renderer.removeClass(element, 'error-focused');
    }, 2000);
  }
}
