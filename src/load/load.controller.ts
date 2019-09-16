import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoadService } from './dao/load.service';
import { ReferenceDTO } from './dao/create.reference.dto';
import FileRoutes from '../constants/app.routes';

@Controller('load')
export class LoadController {

    constructor(private readonly loadService: LoadService) {}

    @Post('/json')
    @UsePipes(ValidationPipe)
    public async loadJson(@Body() createReferenceDTO: ReferenceDTO): Promise<string> {
        try {
            await this.loadService.createReferences(
                FileRoutes.referencesDir,
                `${createReferenceDTO.name}.json` || FileRoutes.referencesFile,
                JSON.stringify(createReferenceDTO.references),
            );
            return `The reference name: ${ createReferenceDTO.name } was saved successfully.`;
        } catch (e) {
            return `The reference name: ${ createReferenceDTO.name } failed to save.`;
        }
    }
}
