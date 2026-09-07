import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentsChangesComponent } from './components-changes.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { ComponentsChanges } from '../../models';

describe('ComponentsChangesComponent', () => {
  let component: ComponentsChangesComponent;
  let fixture: ComponentFixture<ComponentsChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComponentsChangesComponent],
      imports: [
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentsChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map all data correctly', () => {
    const prevComponentName = 'Prev Component name';
    const newComponentName = 'New Component name';
    const prevOutput = [
      {
        modificationDate: '',
        modifiedBy: '',
        outputId: '',
        outputName: '',
        percentageAssigned: 1100,
      },
    ];
    const newOutput = [
      {
        modificationDate: '',
        modifiedBy: '',
        outputId: '',
        outputName: '',
        percentageAssigned: 11,
      },
    ];
    let mockInput: ComponentsChanges = {
      newValues: {
        componentId: '',
        componentName: newComponentName,
        outputs: newOutput,
      },
      previousValues: {
        componentId: '',
        componentName: prevComponentName,
        outputs: prevOutput,
      },
    };
    component.changesComponents = mockInput;
    expect(component.previousComponentName).toBe(prevComponentName);
    expect(component.previousComponentsData).toBe(prevOutput);

    expect(component.newComponentName).toBe(newComponentName);
    expect(component.newComponentsData).toBe(newOutput);
  });
});
