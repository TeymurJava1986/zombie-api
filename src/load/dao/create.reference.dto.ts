
import { IsNotEmpty, IsArray, ValidateNested, MinLength} from 'class-validator';
import { ReferenceInnerDTO } from './create.reference.inner.dto';

export class ReferenceDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    references: ReferenceInnerDTO[];
}
