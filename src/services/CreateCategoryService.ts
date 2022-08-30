import { getCustomRepository } from 'typeorm';

import Category from '../models/Category';

import CategoriesRepository from '../repositories/CategoriesRepository';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const categoryExists = await categoriesRepository.findOneByTitle(title);

    if (!categoryExists) {
      const category = categoriesRepository.create({
        title,
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      await categoriesRepository.save(category);

      return category;
    }

    return categoryExists;
  }
}

export default CreateCategoryService;
