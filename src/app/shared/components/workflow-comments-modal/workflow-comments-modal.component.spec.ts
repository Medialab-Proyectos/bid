import { WorkflowCommentsModalComponent } from './workflow-comments-modal.component';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

async function setup() {
  const { fixture } = await render(WorkflowCommentsModalComponent, {
    declarations: [WorkflowCommentsModalComponent],
    imports: [
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('WorkflowCommentsModalComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
