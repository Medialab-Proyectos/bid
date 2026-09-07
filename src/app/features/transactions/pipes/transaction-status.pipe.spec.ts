import { TransactionsStatus } from '../enums';
import { TransactionStatusPipe } from './transaction-status.pipe';

describe('TransactionStatusPipe', () => {
  let pipe: TransactionStatusPipe;

  beforeEach(() => {
    pipe = new TransactionStatusPipe();
  });

  it('should transform the value to &mdash; when status is EREJECT', () => {
    const result = pipe.transform(123, TransactionsStatus.EREJECT);
    expect(result).toBe('&mdash;');
  });

  it('should transform the value to &mdash; when status is EREJECTEDBYIDB', () => {
    const result = pipe.transform(456, TransactionsStatus.EREJECTEDBYIDB);
    expect(result).toBe('&mdash;');
  });

  it('should return the value as a string when status is not EREJECT or EREJECTEDBYIDB', () => {
    const result = pipe.transform(789, TransactionsStatus.PREV);
    expect(result).toBe('789');
  });

  it('should return &mdash; when the input value is null', () => {
    const result = pipe.transform(null, TransactionsStatus.PVAL);
    expect(result).toBe('&mdash;');
  });
});
