import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

/**
 *
 * @returns winner information form group
 * winnerList is filled with createWinnerInformationGroup function
 */
export function createWinnerInformationForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    winnerList: new UntypedFormArray([], [minimumSelectedWinnersValidation]),
  });
}

/**
 * Use it on the winner list [winnerList]
 * @returns winner information group
 */
export function createWinnerInformationGroup() {
  return new UntypedFormGroup({
    checked: new UntypedFormControl(),
    biddingProcessParticipantId: new UntypedFormControl(null),
    name: new UntypedFormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.minLength(3),
    ]),
    nationality: new UntypedFormControl({ value: '', disabled: true }),
  });
}

/**
 * use it for validate required winner list selection
 * @param winnerList
 * @returns
 */
function minimumSelectedWinnersValidation(control: AbstractControl) {
  const winnerList = control.value as any[];
  const winner = winnerList.some((e) => e.checked);
  if (!winner) {
    return {
      minimumSelectedWinners: true,
    };
  }
  return null;
}
