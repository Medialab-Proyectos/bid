import {
  activitiesSelectedProjectReducer,
  ActivitiesSelectedProjectInitialState,
} from './activitiesSelectedProject.reducer';
import * as actions from '../actions/activitiesSelectedProject.actions';

describe('selectedProjectReducer', () => {
  it('should update the state when setActivitiesSelectedProjectBucketId action is dispatched', () => {
    const initialState = ActivitiesSelectedProjectInitialState;
    const activitiesSelectedProjectBucketId = '12345';
    const action = actions.setActivitiesSelectedProjectBucketId({
      ActivitiesSelectedProjectBucketId: activitiesSelectedProjectBucketId,
    });

    const result = activitiesSelectedProjectReducer(initialState, action);

    expect(result.activitiesSelectedProjectBucketId).toBe(
      activitiesSelectedProjectBucketId
    );
    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
  });
  it('should update the state when unSetActivitiesSelectedProjectBucketId action is dispatched', () => {
    const initialState = ActivitiesSelectedProjectInitialState;
    const action = actions.unSetActivitiesSelectedProjectBucketId();

    const result = activitiesSelectedProjectReducer(initialState, action);

    expect(result.activitiesSelectedProjectBucketId).toBe(null);
    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
  });
});
