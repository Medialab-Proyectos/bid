import { ElementRef, Renderer2 } from '@angular/core';
import { ErrorFocusDirective } from './error-focus.directive';

describe('ErrorFocusDirective', () => {
  let directive: ErrorFocusDirective;
  let mockElementRef: ElementRef;
  let mockRenderer: jest.Mocked<Renderer2>;
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');

    // Mock scrollIntoView
    mockElement.scrollIntoView = jest.fn();

    mockElementRef = new ElementRef(mockElement);
    mockRenderer = {
      addClass: jest.fn(),
      removeClass: jest.fn(),
    } as any;

    directive = new ErrorFocusDirective(mockElementRef, mockRenderer);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should set tabindex to -1', () => {
    expect(directive.tabindex).toBe('-1');
  });

  it('should set errorClass to true', () => {
    expect(directive.errorClass).toBe(true);
  });

  describe('focus', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(mockElement, 'focus');
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should focus element and scroll into view when visible', () => {
      // Mock element as visible
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1',
      } as CSSStyleDeclaration);

      const result = directive.focus();

      expect(result).toBe(true);
      expect(mockElement.focus).toHaveBeenCalled();
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      expect(mockRenderer.addClass).toHaveBeenCalledWith(
        mockElement,
        'error-focused'
      );
    });

    it('should remove highlight class after 2 seconds', () => {
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1',
      } as CSSStyleDeclaration);

      directive.focus();

      expect(mockRenderer.removeClass).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2000);

      expect(mockRenderer.removeClass).toHaveBeenCalledWith(
        mockElement,
        'error-focused'
      );
    });

    it('should return false when element is not visible (width = 0)', () => {
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 0,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 0,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      const result = directive.focus();

      expect(result).toBe(false);
      expect(mockElement.focus).not.toHaveBeenCalled();
      expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
    });

    it('should return false when element is not visible (height = 0)', () => {
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      const result = directive.focus();

      expect(result).toBe(false);
      expect(mockElement.focus).not.toHaveBeenCalled();
    });

    it('should return false when element display is none', () => {
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'none',
        visibility: 'visible',
        opacity: '1',
      } as CSSStyleDeclaration);

      const result = directive.focus();

      expect(result).toBe(false);
      expect(mockElement.focus).not.toHaveBeenCalled();
    });

    it('should return false when element visibility is hidden', () => {
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'hidden',
        opacity: '1',
      } as CSSStyleDeclaration);

      const result = directive.focus();

      expect(result).toBe(false);
      expect(mockElement.focus).not.toHaveBeenCalled();
    });

    it('should return false when element opacity is 0', () => {
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '0',
      } as CSSStyleDeclaration);

      const result = directive.focus();

      expect(result).toBe(false);
      expect(mockElement.focus).not.toHaveBeenCalled();
    });
  });

  describe('focusFirstErrorInDocument', () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      document.body.innerHTML = '';

      // Mock scrollIntoView for HTMLElement prototype
      HTMLElement.prototype.scrollIntoView = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
      consoleWarnSpy.mockRestore();
      document.body.innerHTML = '';
    });

    it('should focus first visible error element', () => {
      const errorElement = document.createElement('mat-error');
      errorElement.setAttribute('fierrorfocus', '');
      document.body.appendChild(errorElement);

      jest.spyOn(errorElement, 'focus');
      jest.spyOn(errorElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1',
      } as CSSStyleDeclaration);

      const result = ErrorFocusDirective.focusFirstErrorInDocument();

      expect(result).toBe(true);
      expect(errorElement.focus).toHaveBeenCalled();
      expect(errorElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      expect(errorElement.getAttribute('tabindex')).toBe('-1');
      expect(errorElement.classList.contains('error-focused')).toBe(true);
    });

    it('should remove error-focused class after 2 seconds', () => {
      const errorElement = document.createElement('mat-error');
      errorElement.setAttribute('fierrorfocus', '');
      document.body.appendChild(errorElement);

      jest.spyOn(errorElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1',
      } as CSSStyleDeclaration);

      ErrorFocusDirective.focusFirstErrorInDocument();

      expect(errorElement.classList.contains('error-focused')).toBe(true);

      jest.advanceTimersByTime(2000);

      expect(errorElement.classList.contains('error-focused')).toBe(false);
    });

    it('should skip invisible elements and focus next visible one', () => {
      const invisibleElement = document.createElement('mat-error');
      invisibleElement.setAttribute('fierrorfocus', '');
      document.body.appendChild(invisibleElement);

      const visibleElement = document.createElement('fi-error-alert');
      visibleElement.setAttribute('fierrorfocus', '');
      document.body.appendChild(visibleElement);

      jest.spyOn(invisibleElement, 'getBoundingClientRect').mockReturnValue({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(visibleElement, 'focus');
      jest.spyOn(visibleElement, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1',
      } as CSSStyleDeclaration);

      const result = ErrorFocusDirective.focusFirstErrorInDocument();

      expect(result).toBe(true);
      expect(visibleElement.focus).toHaveBeenCalled();
    });

    it('should try all selectors in order', () => {
      const element = document.createElement('div');
      element.classList.add('error-focusable');
      document.body.appendChild(element);

      jest.spyOn(element, 'focus');
      jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1',
      } as CSSStyleDeclaration);

      const result = ErrorFocusDirective.focusFirstErrorInDocument();

      expect(result).toBe(true);
      expect(element.focus).toHaveBeenCalled();
    });

    it('should return false and log warning when no visible errors found', () => {
      const result = ErrorFocusDirective.focusFirstErrorInDocument();

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith('❌ No visible errors found');
    });

    it('should return false when only invisible elements exist', () => {
      const invisibleElement = document.createElement('mat-error');
      invisibleElement.setAttribute('fierrorfocus', '');
      document.body.appendChild(invisibleElement);

      jest.spyOn(invisibleElement, 'getBoundingClientRect').mockReturnValue({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      });

      const result = ErrorFocusDirective.focusFirstErrorInDocument();

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith('❌ No visible errors found');
    });
  });
});
