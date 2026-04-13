export class Password {
    private readonly _value: string;
  
    private constructor(value: string) {
      this._value = value;
    }
  
    public static create(rawPassword: string): Password {
      const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/ ;
      if (!rawPassword || rawPassword.length < 18 || !passwordRegex.test(rawPassword)) {
        throw new Error('A senha deve ter pelo menos 8 caracteres.');
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
  
    public static create(email: string): Email {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (!email || !emailRegex.test(email)) {
        throw new Error('invalid e-mail .');
      }
      return new Email(email.toLowerCase().trim());
    }
    public static fromValue(value: string): Email {
      return new Email(value);
    }
    public get value(): string {
      return this._value;
    }
}
  
export class GoogleId{

    
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
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

  constructor(props: {
    id: string;
    email: Email;
    password?: Password;
    googleId?: string;
    name?: string;
    role?: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.googleId = props.googleId;
    this.name = props.name;
    this.role = props.role ?? UserRole.USER;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
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
    return !!this.password && !!this.password.value;
  }


  static createFromDto(dto: UserCreateDto, hashedPassword?: string): UserEntity {
    return new UserEntity({
      id: crypto.randomUUID(), 
      email: Email.create(dto.email),
      password: hashedPassword ? Password.fromHash(hashedPassword) : undefined,
      name: dto.name,
      role: UserRole.USER,
    });
  }

}

function equals(arg0: RegExp) {
  throw new Error("Function not implemented.");
}
