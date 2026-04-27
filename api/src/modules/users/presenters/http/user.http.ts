import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import {
  UserCreateDto,
  UserUpdateDto,
  UserResponseDto,
} from '../dtos/user.dto.js';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetAllUsersUseCase,
  GetByIdUserUseCase,
  UpdateUserUseCase,
} from '../../application/use-cases/user.use-case.js';

type RequestWithUser = FastifyRequest & { user?: { id?: string } };

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getByIdUserUseCase: GetByIdUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: UserCreateDto): Promise<UserResponseDto> {
    return await this.createUserUseCase.execute(dto);
  }

  @Get('getAll')
  @ApiOperation({ summary: 'Lista todos os usuários' })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.getAllUsersUseCase.execute();
  }

  @Get('get/:id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.getByIdUserUseCase.execute(id);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  async update(
    @Param('id') targetId: string,
    @Body() dto: UserUpdateDto,
    @Req() req: RequestWithUser,
  ): Promise<UserResponseDto> {
    const requesterId = this.getRequesterId(req, 'update', targetId);
    return await this.updateUserUseCase.execute(targetId, dto, requesterId);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'delete a user' })
  async delete(
    @Param('id') targetId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    const requesterId = this.getRequesterId(req, 'delete', targetId);
    await this.deleteUserUseCase.execute(targetId, requesterId);
  }

  private getRequesterId(
    req: RequestWithUser,
    action: 'update' | 'delete',
    targetId: string,
  ): string {
    const requesterId = req.user?.id;
    if (!requesterId) {
      this.logger.warn(
        `Unauthorized attempt to ${action} user ${targetId}: requester not present in request context`,
      );
      throw new UnauthorizedException(
        'Authenticated user not found in request',
      );
    }

    return requesterId;
  }
}
