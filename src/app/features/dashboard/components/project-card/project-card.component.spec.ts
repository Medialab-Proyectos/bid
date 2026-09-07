import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { Project, ProjectStatus } from '@core/models';
import { formatNumber } from '@angular/common';
import { ProjectCardComponent } from './project-card.component';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { StoreModule } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Pipe({ name: 'highlightSearch' })
class HighlightSearchPipe implements PipeTransform {
  transform(param) {
    return param;
  }
}
describe('CardComponent should show the project information ', () => {
  let component: ProjectCardComponent;
  let fixture: ComponentFixture<ProjectCardComponent>;
  function instanceMockData() {
    component.data = {
      project: inputProject,
    };
    const rendered = fixture.nativeElement;
    fixture.detectChanges();
    return rendered;
  }
  const inputProject: Project = {
    name: 'Contrato 1',
    operationNumber: 'CO-L001',
    approvedAmount: 123456789,
    executor: 'Ministerio de educacion de colombia',
    executorAcronym: '',
    contract: '1111111',
    institution: 'Ministerio de educacion de colombia',
    status: ProjectStatus.InProgress,
    countryCode: 'CO',
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectCardComponent, HighlightSearchPipe],
      imports: [
        LayoutModule,
        ButtonsModule,
        LabelModule,
        StoreModule.forRoot({}),
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [{ provide: 'windowObject', useValue: window }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create the component correctly', () => {
    expect(component).toBeTruthy();
  });
  test('should project object has correct properties', () => {
    const expectedProperties = [
      'name',
      'operationNumber',
      'executor',
      'contract',
      'executorAcronym',
      'approvedAmount',
      'institution',
      'countryCode',
      'status',
    ].sort();
    const input: string[] = Object.keys(inputProject).sort();
    expect(input).toEqual(expectedProperties);
  });

  test('Button with Operation number should rendered with correct value', () => {
    const rendered = instanceMockData();

    const operationNumberBtn: HTMLButtonElement = rendered.querySelector(
      '.qa-cardComponent-opNumber'
    );
    expect(operationNumberBtn.innerHTML).toContain(
      inputProject.operationNumber
    );
  });
  test('Should show correct contract number value', () => {
    const rendered = instanceMockData();
    const contract: HTMLParagraphElement = rendered.querySelector(
      '.qa-cardComponent-contract'
    );
    expect(contract.innerHTML).toEqual(inputProject.contract.toString());
  });
  test('Should show correct executor value', () => {
    const rendered = instanceMockData();
    const executor: HTMLParagraphElement = rendered.querySelector(
      '.qa-cardComponent-executor'
    );
    expect(executor.innerHTML).toEqual(inputProject.executor);
  });
  test('Should show correct approved amount number value', () => {
    const rendered = instanceMockData();
    const approvedAmount: HTMLParagraphElement = rendered.querySelector(
      '.qa-cardComponent-approvedAmount'
    );
    expect(approvedAmount.innerHTML).toContain(
      formatNumber(inputProject.approvedAmount, 'en-US', '1.2-2')
    );
  });

  describe('toogleExpanded', () => {
    it('should swap the value of expanded', () => {
      component.expanded = false;
      component.toogleExpanded();
      expect(component.expanded).toBeTruthy();
    });
  });

  describe('selectedCard', () => {
    it('should emmit opNumber', () => {
      const spy = jest.spyOn(component.selectedCardEmitter, 'emit');

      component.selectedCard('123', '');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('selectedCardMobile', () => {
    it('should emmit opNumber', () => {
      const spy = jest.spyOn(component.selectedCardEmitter, 'emit');

      component.selectedCardMobile('123', '');
      expect(spy).toHaveBeenCalled();
    });
  });
});
