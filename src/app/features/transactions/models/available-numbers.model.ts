export interface AvailableNumbers {
  requestNumber: number;
  partNumber: number;
  currentRequestPartNumbers: {
    [key: number]: number[];
  };
}
