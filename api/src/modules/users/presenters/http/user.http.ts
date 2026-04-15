import {Controller,Get,Post,Put,Delete,Body,Param,Req,HttpCode,HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserCreateDto, UserUpdateDto, UserResponseDto } from './presenters/dto/user.dto';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetAllUsersUseCase } from './use-cases/get-all-users.use-case';
import { GetByIdUserUseCase } from './use-cases/get-by-id-user.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';

@ApiTags('users') 
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getByIdUserUseCase: GetByIdUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post("create")
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: UserCreateDto): Promise<UserResponseDto> {
    return await this.createUserUseCase.execute(dto);
  }

  @Get("getAll")
  @ApiOperation({ summary: 'Lista todos os usuários' })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.getAllUsersUseCase.execute();
  }

  @Get('get:id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.getByIdUserUseCase.execute(id);
  }

  @Put('update:id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  async update(
    @Param('id') targetId: string,
    @Body() dto: UserUpdateDto,
    @Req() req: any 
  ): Promise<UserResponseDto> {
    const requesterId = req.user.id; 
    return await this.updateUserUseCase.execute(targetId, dto, requesterId);
  }

  @Delete('delete:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'delete a user' })
  async delete(
    @Param('id') targetId: string,
    @Req() req: any
  ): Promise<void> {
    const requesterId = req.UserEntity['id'];
    await this.deleteUserUseCase.execute(targetId, requesterId);
  }
}