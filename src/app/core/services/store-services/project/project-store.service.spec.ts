import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ProjectStoreService } from '@core/services/store-services';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockSelectedProject = {
  selectedProject: {
    countryCode: 'CO',
    name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    executor: 'MINISTERIO DE EDUCACION NACIONAL',
    executorAcronym: 'CO-MEN',
    contract: '4902/OC-CO',
    operationNumber: 'CO-L1229',
    approvedAmount: 60000000,
    status: 'In progress',
  },
  loaded: false,
  loading: false,
  error: null,
};

function getInitialState() {
  return {
    selectedProject: {
      selectedProject: {
        countryCode: 'CO',
        name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
        executor: 'MINISTERIO DE EDUCACION NACIONAL',
        executorAcronym: 'CO-MEN',
        contract: '4902/OC-CO',
        operationNumber: 'CO-L1229',
        approvedAmount: 60000000,
        status: 'In progress',
      },
      loaded: false,
      loading: false,
      error: null,
    },
  };
}

const initialState = getInitialState();

describe('ProjectStoreService', () => {
  let service: ProjectStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({ initialState })],
    });
    service = TestBed.inject(ProjectStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an observable with the expected data', (done) => {
    service.selectedProject().subscribe((data) => {
      expect(data).toEqual(mockSelectedProject);
      done();
    });
  });
});
