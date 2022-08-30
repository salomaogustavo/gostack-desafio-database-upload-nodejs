// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const ballance = await transactionsRepository.getBalance();

      if (ballance.total - value < 0) {
        throw new AppError('Invalid ballance error!');
      }
    }

    const createCategory = new CreateCategoryService();

    const { id } = await createCategory.execute(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: id,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
