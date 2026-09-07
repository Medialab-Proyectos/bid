// rich-text-editor.component.ts
import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  forwardRef,
  Input,
  Optional,
  Host,
  SkipSelf,
  OnInit,
  OnDestroy,
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  AbstractControl,
  ValidationErrors,
  Validator,
  NG_VALIDATORS,
  FormControl,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent
  implements AfterViewInit, OnInit, OnDestroy, ControlValueAccessor, Validator
{
  @ViewChild('editorDiv') editorDiv!: ElementRef;
  @ViewChild('hiddenTextarea') hiddenTextarea!: ElementRef;

  @Input() maxLength: number = 0;
  @Input() placeholder: string = '';

  richTextControl = new FormControl('', []);
  value: string = '';
  disabled: boolean = false;
  charCount: number = 0;
  isRequired: boolean = false;
  private subscription?: Subscription;
  private statusChangesSubscription?: Subscription;

  // Verificar si se ha excedido el límite de caracteres
  get charCountExceeded(): boolean {
    return this.maxLength > 0 && this.charCount > this.maxLength;
  }

  // Mostrar indicador de caracteres solo si se ha establecido un límite
  get showCharCount(): boolean {
    return this.maxLength > 0;
  }

  // ControlValueAccessor methods
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    @Optional() @Host() @SkipSelf() private ngControl: NgControl,
    private sanitizer: DomSanitizer
  ) {
    // Conectar manualmente con el control de formulario
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.detectRequiredState();

    // Escuchar los cambios en richTextControl para sincronizar el estado
    this.subscription = this.richTextControl.valueChanges.subscribe((value) => {
      if (value !== this.value) {
        this.updateContent(value);
      }
    });

    // Suscribirse a cambios de estado del control padre para detectar touched
    if (this.ngControl && this.ngControl.control) {
      this.statusChangesSubscription =
        this.ngControl.control.statusChanges.subscribe(() => {
          // Cuando cambia el estado del control padre (por ejemplo, al hacer submit)
          if (
            this.ngControl.control?.touched &&
            !this.richTextControl.touched
          ) {
            this.richTextControl.markAsTouched();
          }
        });
    }
  }

  ngAfterViewInit(): void {
    // Inicializar el editor después de que la vista esté lista
    this.editorDiv.nativeElement.innerHTML = this.value;
    this.updateCharCount();
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones para prevenir memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.statusChangesSubscription) {
      this.statusChangesSubscription.unsubscribe();
    }
  }

  updateValidators(): void {
    const validators = [];

    if (this.isRequired) {
      validators.push(Validators.required);
    }

    // Añadir validador de longitud máxima si corresponde
    if (this.maxLength > 0) {
      // Validator personalizado para el máximo de caracteres en texto enriquecido
      validators.push(this.createMaxLengthValidator());
    }

    this.richTextControl.setValidators(validators);
    this.richTextControl.updateValueAndValidity();
  }

  /**
   * Crea un validador personalizado para verificar la longitud máxima
   */
  private createMaxLengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const plainText = this.stripHtml(control.value || '');
      if (plainText.length > this.maxLength) {
        return {
          maxlength: {
            requiredLength: this.maxLength,
            actualLength: plainText.length,
          },
        };
      }
      return null;
    };
  }

  /**
   * Detecta si el control está marcado como required en el formulario padre
   */
  detectRequiredState(): void {
    if (this.ngControl && this.ngControl.control) {
      const parentValidators = this.ngControl.control.validator;
      if (parentValidators) {
        const validationErrors = parentValidators({} as AbstractControl);
        this.isRequired =
          validationErrors && validationErrors['required'] !== undefined;
      }
    }
  }

  // Implementación de ControlValueAccessor
  writeValue(value: string): void {
    this.value = value || '';
    this.richTextControl.setValue(value || '', { emitEvent: false });

    // Si el elemento del DOM ya está disponible, actualizar su contenido
    if (this.editorDiv?.nativeElement) {
      this.editorDiv.nativeElement.innerHTML = this.value;
      this.updateCharCount();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (isDisabled) {
      this.richTextControl.disable({ emitEvent: false });
    } else {
      this.richTextControl.enable({ emitEvent: false });
    }

    if (this.editorDiv?.nativeElement) {
      this.editorDiv.nativeElement.contentEditable = !isDisabled;
    }
  }

  // Implementación de Validator
  validate(control: AbstractControl): ValidationErrors | null {
    // Si el control padre tiene validador required, propagar ese estado
    if (control.validator) {
      const validationErrors = control.validator({} as AbstractControl);
      if (validationErrors && validationErrors['required'] !== undefined) {
        this.isRequired = true;
        this.updateValidators();
      }
    }

    if (this.isRequired && this.isEmpty()) {
      return { required: true };
    }

    if (this.maxLength > 0 && this.charCount > this.maxLength) {
      return {
        maxlength: {
          requiredLength: this.maxLength,
          actualLength: this.charCount,
        },
      };
    }

    return null;
  }

  // Verifica si el contenido está vacío (considerando el HTML)
  isEmpty(): boolean {
    const plainText = this.stripHtml(this.value);
    return !plainText || plainText.trim() === '';
  }

  // Métodos para el editor
  formatText(command: string, value: string = ''): void {
    document.execCommand(command, false, value);
    this.editorDiv.nativeElement.focus();
    this.updateValue();
  }

  insertLink(): void {
    const url = prompt('Introduce la URL del enlace:', 'http://');
    if (url) {
      this.formatText('createLink', url);
    }
  }

  onContentChange(_: Event): void {
    this.updateValue();
  }

  updateContent(htmlContent: string): void {
    this.value = htmlContent;

    if (this.editorDiv?.nativeElement) {
      this.editorDiv.nativeElement.innerHTML = htmlContent;
    }

    this.onChange(htmlContent);
    this.updateCharCount();
  }

  private updateValue(): void {
    const htmlContent = this.safeHtmlToString(
      this.sanitizeHtml(this.editorDiv.nativeElement.innerHTML)
    );
    this.value = htmlContent;

    // Actualizar el FormControl sin activar eventos para evitar bucles
    this.richTextControl.setValue(htmlContent, { emitEvent: false });

    this.onChange(htmlContent);
    this.updateCharCount();
  }

  // Método para marcar el control como touched
  markAsTouched(): void {
    this.onTouched();
    this.richTextControl.markAsTouched();

    // Asegurarse de que el control padre también se marque como touched
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.markAsTouched();
    }
  }

  // Nuevos métodos para manejar el conteo de caracteres
  private updateCharCount(): void {
    // Obtener el texto plano sin HTML para contar caracteres reales
    const plainText = this.stripHtml(this.value);
    this.charCount = plainText.length;
  }

  // Eliminar etiquetas HTML para contar solo el texto
  private stripHtml(html: string): string {
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = html;
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  }

  get isTouched() {
    return this.richTextControl.touched;
  }

  // Método para manejar el evento de foco
  handleFocus(): void {
    // Si está vacío y hay un cursor parpadeante, queremos asegurarnos
    // que el cursor esté visible y no detrás del placeholder
    if (this.isEmpty()) {
      // Marcar como touched para asegurar que los validadores se apliquen
      this.markAsTouched();
    }
  }

  sanitizeHtml(
    html: string,
    allowedStyles: string[] = ['text-align'],
    allowedValues: { [key: string]: string[] } = {
      'text-align': ['left', 'center', 'right'],
    }
  ): SafeHtml {
    // Crear un elemento temporal para trabajar con el DOM
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Procesar todos los elementos con atributos style
    this.processNode(tempDiv, allowedStyles, allowedValues);

    // Devolver el HTML limpio y sanitizado
    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
  }

  private processNode(
    node: Node,
    allowedStyles: string[],
    allowedValues: { [key: string]: string[] }
  ): void {
    // Si es un elemento HTML
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      // Sanitizar el atributo style
      if (element.hasAttribute('style')) {
        const sanitizedStyle = this.sanitizeStyle(
          element.getAttribute('style') || '',
          allowedStyles,
          allowedValues
        );

        // Si hay estilos permitidos, establecer el atributo, sino eliminarlo
        if (sanitizedStyle) {
          element.setAttribute('style', sanitizedStyle);
        } else {
          element.removeAttribute('style');
        }
      }

      // Procesar los hijos recursivamente
      Array.from(element.childNodes).forEach((child) => {
        this.processNode(child, allowedStyles, allowedValues);
      });
    }
  }

  private sanitizeStyle(
    styleAttr: string,
    allowedStyles: string[],
    allowedValues: { [key: string]: string[] }
  ): string {
    // Dividir el string de estilo en propiedades individuales
    const styleProps = styleAttr
      .split(';')
      .map((prop) => prop.trim())
      .filter((prop) => prop !== '');

    // Filtrar solo las propiedades y valores permitidos
    const sanitizedProps = styleProps.filter((prop) => {
      const [name, value] = prop.split(':').map((part) => part.trim());

      // Verificar si la propiedad está en la lista de permitidos
      if (!allowedStyles.includes(name)) {
        return false;
      }

      // Si hay una lista de valores permitidos para esta propiedad
      if (allowedValues[name]) {
        // Verificar si el valor está permitido
        return allowedValues[name].includes(value);
      }

      // Si no hay una lista específica de valores para esta propiedad, permitirla
      return true;
    });

    // Unir las propiedades permitidas en un string
    return sanitizedProps.join('; ');
  }

  safeHtmlToString(safeHtml: SafeHtml): string {
    return (
      safeHtml as unknown as { changingThisBreaksApplicationSecurity: string }
    ).changingThisBreaksApplicationSecurity;
  }
}
