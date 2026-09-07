import { StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { ProjectComponent } from './project.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { render } from '@testing-library/angular';
import { provideMockStore } from '@ngrx/store/testing';
import { Project, ProjectStatus } from '@core/models';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const projects: Project[] = [
  {
    countryCode: 'PN',
    name: 'Sustainable Rural Electrification Program in Panama',
    nameEs: 'Programa de Electrificación Rural Sostenible en Panama',
    nameFr: '  ',
    namePt: '  ',
    executor: 'Oficina de Electrificacion Rural',
    executorAcronym: 'PN-OER',
    contract: '3166/CH-PN',
    operationNumber: 'PN-L1095',
    approvedAmount: 10000000,
    status: ProjectStatus.Finished,
    projectBucketId: '06a4e7fd-ff7d-44c7-ad23-132ea397fc01',
    id: '',
    nameEn: '',
    projectName: {
      en: '',
      es: '',
      fr: '',
      pt: '',
    },
    currentApprovedAmount: 10000000,
    favorite: false,
  },
];

const initialState = {
  projects: {
    projects: projects,
  },
};

async function setup() {
  const { fixture } = await render(ProjectComponent, {
    declarations: [ProjectComponent],
    imports: [
      RouterTestingModule,
      StoreModule.forRoot({}),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      HttpClientTestingModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      { provide: 'windowObject', useValue: window },
      provideMockStore({ initialState }),
    ],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ProjectComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
