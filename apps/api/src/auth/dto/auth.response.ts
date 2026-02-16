import { ObjectType, Field } from '@nestjs/graphql';
import { UserResponse } from './user.response';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => UserResponse)
  user: UserResponse;
}

@ObjectType()
export class RiotAuthUrlResponse {
  @Field()
  authUrl: string;
}
