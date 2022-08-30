import { EntityRepository, In, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findOneByTitle(title: string): Promise<Category | null> {
    const categoryExists = await this.findOne({
      where: { title: In([title]) },
    });

    return categoryExists || null;
  }

  public async findByTitles(titles: string[]): Promise<Category[] | null> {
    const categoryExists = await this.find({
      where: { title: In(titles) },
    });

    return categoryExists || null;
  }
}

export default CategoriesRepository;
