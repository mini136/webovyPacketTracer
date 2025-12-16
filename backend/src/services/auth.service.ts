import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ access_token: string; user: any }> {
    const { username, email, password } = registerDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      username,
      email,
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
    });

    // Generate token
    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user._id as any).toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: any }> {
    const { username, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userModel.updateOne(
      { _id: user._id },
      { lastLogin: new Date() },
    );

    // Generate token
    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user._id as any).toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: new Date(),
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.userModel.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async createInitialAdmin(): Promise<void> {
    const adminExists = await this.userModel.findOne({ role: UserRole.ADMIN });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });
      console.log('✅ Initial admin user created: admin / admin123');
    }
  }
}
