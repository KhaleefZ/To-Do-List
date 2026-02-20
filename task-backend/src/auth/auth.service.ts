import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema.js';
import { AuthDto } from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(authDto: AuthDto) {
    const { email, password } = authDto;
    
    // Check if user exists
    const exists = await this.userModel.findOne({ email });
    if (exists) throw new ConflictException('User already exists');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new this.userModel({ email, password: hashedPassword });
    await user.save();
    
    return { message: 'User registered successfully' };
  }

  async login(authDto: AuthDto) {
    const { email, password } = authDto;
    const user = await this.userModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload),
        userId: user._id,
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}