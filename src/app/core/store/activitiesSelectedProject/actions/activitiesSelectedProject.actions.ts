import { createAction, props } from '@ngrx/store';

export const setActivitiesSelectedProjectBucketId = createAction(
  '[ActivitiesSelectedProject] set ActivitiesSelectedProjectBucketId',
  props<{ ActivitiesSelectedProjectBucketId: string }>()
);
export const unSetActivitiesSelectedProjectBucketId = createAction(
  '[ActivitiesSelectedProject] remove ActivitiesSelectedProjectBucketId'
);
