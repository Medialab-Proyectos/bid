import { MaskingStatusPipe } from './masking-status.pipe';

describe('MaskingStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new MaskingStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
