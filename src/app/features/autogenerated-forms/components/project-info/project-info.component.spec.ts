import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectInfoComponent } from './project-info.component';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('ProjectInfoComponent', () => {
  let component: ProjectInfoComponent;
  let fixture: ComponentFixture<ProjectInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectInfoComponent],
      imports: [HttpClientTestingModule],
      providers: [provideMockStore(), ...commonTestProviders],
    });
    fixture = TestBed.createComponent(ProjectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
