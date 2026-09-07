export interface ItemAction<T = unknown> {
  id: string;
  action: T;
}
