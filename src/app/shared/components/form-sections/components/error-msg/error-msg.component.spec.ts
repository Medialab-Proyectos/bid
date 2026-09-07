import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorFormMsgComponent } from './error-msg.component';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

@Component({
  template: `
    <fi-form-error-msg [control]="control" [key]="key"> </fi-form-error-msg>
  `,
})
class TestComponent {
  control = new FormControl({});
  key = 'KEY';
}

async function setup() {
  const { fixture } = await render(TestComponent, {
    declarations: [ErrorFormMsgComponent],
    imports: [
      CommonModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
  });
  const component = fixture.componentInstance;
  return {
    component,
    fixture,
  };
}

describe('ErrorMsgComponent', () => {
  it('should be created', async () => {
    await setup();
  });
  it('should show the alert on new error of the form', async () => {
    const { component, fixture } = await setup();
    component.control.setErrors({ incorrect: true });
    component.control.markAsTouched();
    fixture.detectChanges();
    expect(screen.getByText(/KEY/i)).toBeInTheDocument();
  });

  it('should not show the alert on new error of the form', async () => {
    const { component, fixture } = await setup();
    component.control.setErrors(null);
    component.control.markAsTouched();
    fixture.detectChanges();
    expect(screen.queryByText(/KEY/i)).not.toBeInTheDocument();
  });
});
