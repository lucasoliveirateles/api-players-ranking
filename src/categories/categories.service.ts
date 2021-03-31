import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './interfaces/category.interface';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dtos/create-categories.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { PlayersService } from 'src/players/players.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    private readonly playersService: PlayersService,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const { category } = createCategoryDto;

    const categoryExists = await this.categoryModel
      .findOne({ category })
      .exec();

    if (categoryExists) {
      throw new BadRequestException(`Category ${category} already exists.`);
    }

    const categoryCreated = new this.categoryModel(createCategoryDto);

    return await categoryCreated.save();
  }

  async searchAllCategories(): Promise<Array<Category>> {
    return await this.categoryModel.find().populate('players').exec();
  }

  async searchCategoryToId(category: string): Promise<Array<Category>> {
    const categoryExists = await this.categoryModel
      .find({ category })
      .populate('players')
      .exec();

    if (!categoryExists) {
      throw new NotFoundException(`Category ${category} not found.`);
    }

    return categoryExists;
  }

  async searchCategoryPlayer(idPlayer: any): Promise<Category> {
    const players = await this.playersService.searchAllPlayers();

    const playerFilter = players.filter((player) => player._id == idPlayer);

    if (playerFilter.length == 0) {
      throw new BadRequestException(`The id ${idPlayer} is not a player.`);
    }

    return await this.categoryModel
      .findOne()
      .where('players')
      .in(idPlayer)
      .exec();
  }

  async updateCategory(
    category: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    const categoryExists = await this.categoryModel
      .findOne({ category })
      .exec();

    if (!categoryExists) {
      throw new NotFoundException(`Category ${category} not found.`);
    }

    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: updateCategoryDto })
      .exec();
  }

  async assignCategoryPlayer(params: string[]): Promise<void> {
    const category = params['category'];
    const idPlayer = params['idPlayer'];

    const categoryExists = await this.categoryModel
      .findOne({ category })
      .exec();

    const playerRegisterCategory = await this.categoryModel
      .find({ category })
      .where('players')
      .in([idPlayer])
      .exec();

    await this.playersService.searchPlayerToId(idPlayer);

    if (!categoryExists) {
      throw new BadRequestException(`Category ${category} no found.`);
    }

    if (playerRegisterCategory.length > 0) {
      throw new BadRequestException(
        `Player ${idPlayer} already registered in category ${category}`,
      );
    }

    categoryExists.players.push(idPlayer);

    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: categoryExists })
      .exec();
  }
}
