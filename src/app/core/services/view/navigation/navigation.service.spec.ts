import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationService } from './navigation.service';
import { Router } from '@angular/router';

describe('NavigationService', () => {
  let service: NavigationService;
  let router: Router;
  let navigateSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [NavigationService],
    });
    service = TestBed.inject(NavigationService);
    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate to path without param', () => {
    const path = '/home';

    service.navigateTo(path);

    expect(navigateSpy).toHaveBeenCalledWith([path]);
  });
});
