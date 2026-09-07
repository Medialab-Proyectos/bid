import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[fiTimeMask]',
})
export class TimeMaskDirective {
  constructor(private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9:]/g, '');

    // Si contiene dos puntos, manejamos la situación especial
    if (value.includes(':')) {
      const parts = value.split(':');
      let hours = parts[0].replace(/\D/g, '');
      let minutes = parts[1]?.replace(/\D/g, '') || '';

      // Limitar horas a 2 dígitos y validar (0-23)
      if (hours.length > 2) {
        hours = hours.substring(0, 2);
      }

      // Limitar minutos a 2 dígitos y validar (0-59)
      if (minutes.length > 2) {
        minutes = minutes.substring(0, 2);
      }

      let hoursNum = parseInt(hours, 10);
      if (!isNaN(hoursNum) && hoursNum > 23) {
        hours = '23';
      }

      let minutesNum = parseInt(minutes, 10);
      if (!isNaN(minutesNum) && minutesNum > 59) {
        minutes = '59';
      }

      // Reconstruir el valor
      value = hours + (minutes.length > 0 ? ':' + minutes : ':');
    } else {
      // Si no tiene dos puntos, manejamos la entrada normal
      value = value.replace(/[^0-9]/g, '');

      // Limitar a 4 dígitos
      if (value.length > 4) {
        value = value.substring(0, 4);
      }

      // Aplicar formato hora:minuto automáticamente después de ingresar 2 dígitos
      if (value.length >= 3) {
        let hours = value.substring(0, 2);
        let minutes = value.substring(2);

        // Validar hora (0-23)
        const hoursNum = parseInt(hours, 10);
        if (hoursNum > 23) {
          hours = '23';
        }

        // Validar minutos (0-59)
        const minutesNum = parseInt(minutes, 10);
        if (minutesNum > 59) {
          minutes = '59';
        }

        // Formato HH:MM
        value = hours + ':' + minutes;
      }
    }

    // Actualizar el input y el valor del control
    input.value = value;
    this.control.control?.setValue(value, { emitEvent: true });
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9:]/g, '');

    // Si está vacío, dejarlo vacío
    if (value.length === 0) {
      input.value = '';
      this.control.control?.setValue('', { emitEvent: true });
      return;
    }

    // Si solo hay dos puntos o termina con dos puntos, corregir
    if (value === ':' || value.endsWith(':')) {
      value = value.replace(':', '');
    }

    // Si solo hay dos dígitos, asumimos que son las horas
    if (value.length === 2 && !value.includes(':')) {
      const hour = parseInt(value, 10);
      if (hour > 23) {
        value = '23:00';
      } else {
        value = value.padStart(2, '0') + ':00';
      }
    }

    // Si hay un dígito, asumimos que es una hora
    if (value.length === 1) {
      const hour = parseInt(value, 10);
      value = hour.toString().padStart(2, '0') + ':00';
    }

    // Si no tiene formato, intentar formatearlo
    if (!value.includes(':')) {
      if (value.length <= 2) {
        value = value.padStart(2, '0') + ':00';
      } else {
        value =
          value.substring(0, 2).padStart(2, '0') +
          ':' +
          value.substring(2, 4).padStart(2, '0');
      }
    }

    // Si tiene formato pero está incompleto
    if (value.includes(':')) {
      const parts = value.split(':');
      const hours = parts[0].padStart(2, '0');
      const minutes = (parts[1] || '').padStart(2, '0');

      // Validar hora (0-23)
      const hoursNum = parseInt(hours, 10);
      const validHours = hoursNum > 23 ? '23' : hours;

      // Validar minutos (0-59)
      const minutesNum = parseInt(minutes, 10);
      const validMinutes = minutesNum > 59 ? '59' : minutes;

      value = validHours + ':' + validMinutes;
    }

    // Verificar que el formato final sea correcto según el patrón HH:MM
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      // Si no cumple con el patrón, realizar corrección final
      const parts = value.split(':');
      let hours = parts[0] || '00';
      let minutes = parts[1] || '00';

      // Asegurar que las horas estén entre 00-23
      const hoursNum = parseInt(hours, 10);
      if (isNaN(hoursNum) || hoursNum > 23) {
        hours = '23';
      } else {
        hours = hours.padStart(2, '0');
      }

      // Asegurar que los minutos estén entre 00-59
      const minutesNum = parseInt(minutes, 10);
      if (isNaN(minutesNum) || minutesNum > 59) {
        minutes = '59';
      } else {
        minutes = minutes.padStart(2, '0');
      }

      value = hours + ':' + minutes;
    }

    input.value = value;
    this.control.control?.setValue(value, { emitEvent: true });
  }
}
