import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, AuthService } from '../services/auth.service';
import { UserDocument } from '../schemas/user.schema';
import { loadAppConfig } from '../config/app-config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: loadAppConfig().jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    return this.authService.validateUser(payload);
  }
}
