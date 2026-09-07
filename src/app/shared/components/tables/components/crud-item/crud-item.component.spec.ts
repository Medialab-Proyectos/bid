import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudItemComponent } from './crud-item.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { Action } from '@core/enums';

describe('CrudItemComponent', () => {
  let component: CrudItemComponent;
  let fixture: ComponentFixture<CrudItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrudItemComponent],
      imports: [
        PopupModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onToggle', () => {
    it('should set show to true ', () => {
      component.onToggle();
      expect(component.show).toBe(true);
    });
    it('should set show to false ', () => {
      component.show = true;
      component.onToggle();
      expect(component.show).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should set expandedOptions to true ', () => {
      component.toggle();
      expect(component.expandedOptions).toBe(true);
    });
    it('should set expandedOptions to false ', () => {
      component.expandedOptions = true;
      component.toggle();
      expect(component.expandedOptions).toBe(false);
    });
  });

  it('should emit the action ', () => {
    const action = 'action';
    const itemID = 'item';
    const emitterSpy = jest.spyOn(component.actionitemID, 'emit');
    component.itemID = itemID;

    component.emitActionItem(action);
    expect(emitterSpy).toHaveBeenCalledWith({
      id: itemID,
      action: Action[action],
    });
  });
});
