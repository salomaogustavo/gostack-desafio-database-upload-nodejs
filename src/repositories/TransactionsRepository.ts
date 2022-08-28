import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = transactions.reduce(
      (balance, transaction) => {
        const b = balance;

        if (transaction.type === 'income') {
          b.income += Number(transaction.value);
        } else {
          b.outcome += Number(transaction.value);
        }

        return b;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
