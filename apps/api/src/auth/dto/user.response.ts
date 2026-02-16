import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserResponse {
  @Field()
  id: string;

  @Field()
  riotId: string;

  @Field()
  gameName: string;

  @Field()
  tagLine: string;

  @Field(() => String, { nullable: true })
  riotPuuid?: string | null;
}
