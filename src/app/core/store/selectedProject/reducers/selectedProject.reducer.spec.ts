import {
  SelectedProjectState,
  selectedProjectReducer,
} from './selectedProject.reducer';
import * as selectedProjectActions from '../actions/selectedProject.actions';

describe('selectedProjectReducer', () => {
  it('should update state with loading true when setting selected project', () => {
    const action = selectedProjectActions.setSelectedProject({
      SelectedProject: stateMock.selectedProject,
    });

    const newState = selectedProjectReducer(stateMock.selectedProject, action);

    expect(newState).toEqual({
      ...stateMock.selectedProject,
      loading: true,
    });
  });

  it('should update state with loading false, loaded true, and set selectedProject when setting selected project success', () => {
    const action = selectedProjectActions.setSelectedProjectSuccess({
      SelectedProject: stateMock.selectedProject,
    });

    const newState = selectedProjectReducer(
      SelectedProjectInitialState,
      action
    );

    const expectedState = {
      selectedProject: { ...stateMock.selectedProject },
      loading: false,
      loaded: true,
      error: null,
    };

    expect(newState).toEqual(expectedState);
  });

  it('should update state with loading false, loaded true, and set error when setting selected project error', () => {
    const error = { message: 'Failed to fetch selected project' };
    const action = selectedProjectActions.setSelectedProjectError({
      payload: error,
    });

    const newState = selectedProjectReducer(
      SelectedProjectInitialState,
      action
    );

    expect(newState).toEqual({
      ...SelectedProjectInitialState,
      loading: false,
      loaded: true,
      error: error,
    });
  });
});

const stateMock: SelectedProjectState = {
  selectedProject: {
    nameEs: '',
    nameFr: '',
    namePt: '',
    projectBucketId: '',
    id: '0',
    currentApprovedAmount: 0,
    favorite: false,
    countryCode: 'CO',
    name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    executor: 'MINISTERIO DE EDUCACION NACIONAL',
    executorAcronym: 'CO-MEN',
    contract: '4902/OC-CO',
    operationNumber: 'CO-L1229',
    approvedAmount: 60000000,
    nameEn: '',
    projectName: {
      en: '',
      es: '',
      fr: '',
      pt: '',
    },
  },
  loaded: false,
  loading: false,
  error: null,
};

const SelectedProjectInitialState: SelectedProjectState = {
  selectedProject: null,
  loaded: false,
  loading: false,
  error: null,
};
