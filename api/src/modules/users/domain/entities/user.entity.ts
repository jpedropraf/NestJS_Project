const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
const PASSWORD_MIN_LENGTH = 12;

export class Password {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(rawPassword: string): Password {
    if (
      !rawPassword ||
      rawPassword.length < PASSWORD_MIN_LENGTH || 
      !PASSWORD_REGEX.test(rawPassword)
    ) {
      throw new Error(
        `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres, ` +
        'incluindo maiúscula, minúscula, número e caractere especial.',
      );
    }
    return new Password(rawPassword);
  }

  public static fromHash(hash: string): Password {
    return new Password(hash);
  }

  public get value(): string {
    return this._value;
  }
}

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(raw: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!raw || !emailRegex.test(raw)) {
      throw new Error('E-mail inválido.');
    }
    return new Email(raw.toLowerCase().trim());
  }

  public static fromValue(value: string): Email {
    return new Email(value);
  }

  public get value(): string {
    return this._value;
  }
}

export class GoogleId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(raw: string): GoogleId {
    if (!raw || raw.trim().length === 0) {
      throw new Error('GoogleId inválido.');
    }
    return new GoogleId(raw.trim());
  }

  public static fromValue(value: string): GoogleId {
    return new GoogleId(value);
  }

  public get value(): string {
    return this._value;
  }
}


export enum UserRole {
  USER  = 'USER',
  ADMIN = 'ADMIN',
}


export interface UserProperties {
  id: string;
  email: Email;
  password?: Password;
  googleId?: GoogleId; 
  name?: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserEntity {
  readonly id: string;
  readonly googleId?: GoogleId;
  readonly name?: string;
  readonly email: Email;
  readonly password?: Password;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor( properties: UserProperties) {
    this.id        = properties.id;
    this.email     = properties.email;
    this.password  = properties.password;
    this.googleId  = properties.googleId;
    this.name      = properties.name;
    this.role      = properties.role ?? UserRole.USER;
    this.createdAt = properties.createdAt ?? new Date();
    this.updatedAt = properties.updatedAt ?? new Date();
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  canEdit(targetUserId: string): boolean {
    return this.id === targetUserId || this.isAdmin;
  }

  get isSocialLogin(): boolean {
    return !!this.googleId;
  }

  get hasSetPassword(): boolean {
    return !!this.password?.value;
  }



  withUpdates(changes: Partial<Omit<UserProperties, 'id' | 'createdAt'>>): UserEntity {
      return new UserEntity({
        id:        this.id,
        email:     changes.email     ?? this.email,
        password:  changes.password  ?? this.password,
        googleId:  changes.googleId  ?? this.googleId,
        name:      changes.name      ?? this.name,
        role:      changes.role      ?? this.role,
        createdAt: this.createdAt,
        updatedAt: new Date(),
      });
    }



  static createFromDto(dto: { email: string; name?: string }, hashedPassword?: string): UserEntity {
    return new UserEntity({
      id:       crypto.randomUUID(),
      email:    Email.create(dto.email),
      password: hashedPassword ? Password.fromHash(hashedPassword) : undefined,
      name:     dto.name,
      role:     UserRole.USER,
    });
  }
}

