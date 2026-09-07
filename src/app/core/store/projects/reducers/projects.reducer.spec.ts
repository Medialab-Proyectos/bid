import { projectReducer, projectInitialState } from './projects.reducer';
import * as actions from '../actions/projects.actions';
import { PreferencesModel, Project } from '@core/models';

describe('ProcurementProcessHeaderReducer', () => {
  it('should set initial state', () => {
    expect(projectInitialState).toEqual(projectInitialState);
  });
  it('should getProjects', () => {
    const actualPreferences: PreferencesModel = {
      defaultLanguage: 'es',
      preferredLanguage: 'es',
      projects: [
        {
          operationNumber: 'operationNumber1X',
          contractNumber: '',
          projectBucket: '',
        },
      ],
      procurementPreferences: null,
    };
    const action = actions.getProjects({ preferences: actualPreferences });

    const result = projectReducer(projectInitialState, action);
    const resultState = { ...projectInitialState, loading: true };

    expect(result).toEqual(resultState);
  });

  it('should update the state when getProjectsSuccess action is dispatched', () => {
    const initialState = projectInitialState;
    const projects: Project[] = [
      {
        nameEs: '',
        nameFr: '',
        namePt: '',
        projectBucketId: '',
        id: '0',
        nameEn: '',
        projectName: {
          en: '',
          es: '',
          fr: '',
          pt: '',
        },
        currentApprovedAmount: 0,
        favorite: false,
        countryCode: 'CO',
        name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
        executor: 'MINISTERIO DE EDUCACION NACIONAL',
        executorAcronym: 'CO-MEN',
        contract: '4902/OC-CO',
        operationNumber: 'CO-L1229',
        approvedAmount: 60000000,
      },
    ];
    const action = actions.getProjectsSuccess({ projects });

    const result = projectReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
    expect(result.projects).toEqual([...projects]);
  });

  it('should update the state when getProjectsError action is dispatched', () => {
    const initialState = projectInitialState;
    const payload = 'Error fetching projects';
    const action = actions.getProjectsError({ payload });

    const result = projectReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
    expect(result.error).toBe(payload);
  });

  it('should update the state when setLoading action is dispatched', () => {
    const initialState = projectInitialState;
    const loading = true;
    const action = actions.setLoading({ loading });

    const result = projectReducer(initialState, action);

    expect(result.loading).toBe(loading);
    expect(result.loaded).toBe(!loading);
  });
});
