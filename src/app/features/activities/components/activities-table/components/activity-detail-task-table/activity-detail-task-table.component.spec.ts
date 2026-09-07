import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivityTaskTableComponent } from './activity-detail-task-table.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TaskRowResponse } from '@core/models';

describe('ActivityTaskTableComponent', () => {
  let component: ActivityTaskTableComponent;
  let fixture: ComponentFixture<ActivityTaskTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({}), // Asegúrate de importar los módulos necesarios para las dependencias del componente
        TranslateModule.forRoot(),
      ],
      declarations: [ActivityTaskTableComponent],
      providers: [TranslateService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityTaskTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnChanges', () => {
    it('should format and set gridData and gridView when activityTaskRows changes', () => {
      let users: TaskRowResponse[] = [];
      const changes = {
        activityTaskRows: {
          currentValue: users,
        },
      };

      component.ngOnChanges(changes);

      expect(component.gridData).toEqual(changes.activityTaskRows.currentValue);
      expect(component.gridView).toEqual(component.gridData);
    });

    it('should not format or set gridData and gridView when activityTaskRows does not change', () => {
      const changes = {};

      component.ngOnChanges(changes);

      expect(component.gridData).toBeUndefined();
      expect(component.gridView).toBeUndefined();
    });
  });

  // Aquí puedes agregar más pruebas para cubrir los escenarios y casos de uso relevantes en el componente
});
