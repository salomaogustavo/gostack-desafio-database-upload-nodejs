import { getCustomRepository } from 'typeorm';

import Category from '../models/Category';

import CategoriesRepository from '../repositories/CategoriesRepository';

class CreateCategoriesService {
  public async execute(titles: string[]): Promise<Category[]> {
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const existentCategories = await categoriesRepository.findByTitles(titles);

    const existentCategoriesTitles = existentCategories?.map(
      (category: Category) => category.title,
    );

    const nonexistentCategoriesTitles = titles
      .filter(category => !existentCategoriesTitles?.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      nonexistentCategoriesTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const categories = [...newCategories];

    if (existentCategories) {
      categories.push(...existentCategories);
    }

    return categories;
  }
}

export default CreateCategoriesService;
