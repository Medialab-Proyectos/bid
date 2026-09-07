import { AddCommentComponent } from './add-comment.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
const form = new FormGroup({
  visibility: new FormControl(''),
  text: new FormControl(''),
});
async function setup() {
  const { fixture } = await render(AddCommentComponent, {
    componentProperties: {
      formGroup: form,
    },
    declarations: [AddCommentComponent],
    imports: [
      ReactiveFormsModule,
      FormsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, DialogRef],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}
describe('AddComments component', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
