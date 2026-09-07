import { RouterTestingModule } from '@angular/router/testing';
import { Project, ProjectStatus } from '@core/models';
import { provideMockStore } from '@ngrx/store/testing';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProjectHeaderComponent } from './project-header.component';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const project: Project = {
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
  id: '5632',
  nameEn: '',
  projectName: {
    en: '',
    es: '',
    fr: '',
    pt: '',
  },
  institution: '',
  location: '',
  currentApprovedAmount: 10000000,
  favorite: false,
};

function getInitialState(code: string = 'en', name: string = 'English') {
  return {
    selectedProject: {
      selectedProject: project,
      loaded: true,
      loading: false,
      error: null,
    },
    preferences: {
      selectedLanguage: {
        code: code,
        name: name,
      },
      loaded: true,
    },
  };
}

async function setup(initialState = getInitialState()) {
  const { fixture } = await render(ProjectHeaderComponent, {
    componentProperties: {
      project,
    },
    declarations: [ProjectHeaderComponent, IfNumberPipe],
    imports: [
      RouterTestingModule,
      PipeModule,
      HttpClientTestingModule,
      IndicatorsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      { provide: 'windowObject', useValue: window },
      provideMockStore({ initialState }),
    ],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ProjectHeaderComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('toogleExpandedData', () => {
    it('should set mobileExpanded to true', async () => {
      const { component } = await setup();
      component.toogleExpandedData();
      expect(component.mobileExpanded).toBe(false);
    });
  });

  describe('getLanguageSelected', () => {
    describe('es Case', () => {
      it('should set projectName to project.nameEs', async () => {
        const { component, fixture } = await setup(
          getInitialState('es', 'Spanish')
        );
        component.getLanguageSelected();
        fixture.detectChanges();

        component.projectStoreSvc.languageSelected().subscribe(() => {
          expect(component.projectName).toBe(component.project.nameEs);
        });
      });
    });

    describe('fr Case', () => {
      it('should set projectName to project.nameFr', async () => {
        const { component, fixture } = await setup(
          getInitialState('fr', 'French')
        );
        component.getLanguageSelected();
        fixture.detectChanges();

        component.projectStoreSvc.languageSelected().subscribe(() => {
          expect(component.projectName).toBe(component.project.nameFr);
        });
      });
    });

    describe('pt Case', () => {
      it('should set projectName to project.namePt', async () => {
        const { component, fixture } = await setup(
          getInitialState('pt', 'Portuguese')
        );
        component.getLanguageSelected();
        fixture.detectChanges();

        component.projectStoreSvc.languageSelected().subscribe(() => {
          expect(component.projectName).toBe(component.project.namePt);
        });
      });
    });

    describe('default case', () => {
      it('should set projectName to project.name', async () => {
        const { component, fixture } = await setup(
          getInitialState('default', 'default')
        );
        component.getLanguageSelected();
        fixture.detectChanges();

        component.projectStoreSvc.languageSelected().subscribe(() => {
          expect(component.projectName).toBe(component.project.name);
        });
      });
    });
  });
});
