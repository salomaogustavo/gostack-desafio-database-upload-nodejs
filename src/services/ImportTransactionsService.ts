import { getCustomRepository } from 'typeorm';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoriesService from './CreateCategoriesService';

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const filePath = path.resolve(uploadConfig.dir, fileName);
    const contactsReadStream = fs.createReadStream(filePath);

    const parseStream = parse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = contactsReadStream.pipe(parseStream);
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    await fs.promises.unlink(filePath);

    const createCategories = new CreateCategoriesService();
    const finalCategories = await createCategories.execute(categories);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category_id: finalCategories.find(
          category => category.title === transaction.category,
        )?.id,
      })),
    );

    await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
