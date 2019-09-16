import { IsNotEmpty, IsUrl } from 'class-validator';

export class ReferenceInnerDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsUrl()
    endpoint: string;
}
