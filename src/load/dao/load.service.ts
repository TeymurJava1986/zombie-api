import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export enum FileSystemReadingPermission {
    reading = 'r',
    readingWriting = 'r+',
    readingSync = 'rs',
    readingWritingSync = 'rs+',
}

export enum FileSystemWritingPermission {
    writingCreateTruncate = 'w',
    writingIfPathExists = 'wx',
    writingReading = 'w+',
    writingReadingIfPathExists = 'wx+',
}

export enum FileSystemAppendingPermission {
    append = 'a',
    appendIfPathExists = 'ax',
    appendRead = 'a+',
    appendReadIfPathExists = 'ax+',
}

export enum FileManagingMode {
    read = 'r',
    write = 'w',
    append = 'a',
}

export enum FSMode {
    sync = 'sync',
    async = 'async',
}

@Injectable()
export class LoadService {
    private Logger = new Logger('LoadService');
    /**
     * getFilesDirectory - is function returns back full path to root of the project
     */
    private getFilesDirectory = (): string => path.dirname(process.mainModule.filename);

    /**
     * readWrite - is the async func that support fs.readFile / fs.readFileAsync or fs.writeFile / fs.writeFileAsync
     * depended from the permission it received and mode.
     * @prop permission: FileSystemReadingPermission / FileSystemWritingPermission / FileSystemAppendingPermission
     * @prop mode: FileManagingMode - 'r' (read), 'w' - (write), 'a' - (append)
     * @prop dir: string - directory to store after the root
     * @prop fileName: string - a name of the file
     * @prop resultCB: func - call back function to mange result
     * return Promise<void> | undefined
     */
    private readWriteFile = async (
        dir: string,
        fileName: string,
        mode: FileManagingMode,
        permission?: string,
        resultCB?: (a: Buffer) => Promise<string | void>,
        appendData?: string,
    ): Promise<void> => {
        if (!dir || !fileName || !permission) {
             this.Logger.log(`Didn't received required arguments to open directory.`);
             return;
        }
        const filePath = path.join(this.getFilesDirectory(), dir, fileName);
        switch (mode) {
            case FileManagingMode.read:
                switch (permission) {
                    case FileSystemReadingPermission.reading:
                    case FileSystemReadingPermission.readingWriting:
                        const readFileCB = (err: NodeJS.ErrnoException | null, buf: Buffer) => {
                            if (err) {
                                 this.Logger.log(`Cannot read the file.`);
                            }
                            resultCB && resultCB(buf);
                        };
                        await fs.readFile(filePath, readFileCB);
                        return;
                    case FileSystemReadingPermission.readingSync:
                    case FileSystemReadingPermission.readingWritingSync:
                    default:
                        const fileBuffer: Buffer = await fs.readFileSync(filePath);
                        resultCB && resultCB(fileBuffer);
                        return;
                }
            case FileManagingMode.write:
                if (permission) {
                    await fs.writeFileSync(filePath, appendData, { flag: permission });
                    return;
                }
                await fs.writeFileSync(filePath, appendData, { flag: FileSystemWritingPermission.writingCreateTruncate });
                return;
            case FileManagingMode.append:
                if (permission) {
                    await fs.writeFileSync(filePath, appendData, { flag: permission });
                    return;
                }
                await fs.writeFileSync(filePath, appendData, { flag: FileSystemAppendingPermission.append });
                return;
        }
    }
    /**
     * readWrite - is the async func that support fs.read / fs.readAsync or fs.write / fs.writeAsync
     * depended from the permission it received and mode.
     * @prop permission: FileSystemReadingPermission / FileSystemWritingPermission / FileSystemAppendingPermission
     * @prop mode:FileManagingMode - 'r' (read), 'w' - (write), 'a' - (append)
     * @prop dir: string - directory to store after the root
     * @prop fileName: string - a name of the file
     * @prop fd: FormData - received data from openFile func
     * @prop resultCB: func - call back function to mange result
     * return Promise<void> | undefined
     */
    private readWrite = async (
        permission: string,
        mode: FileManagingMode,
        dir: string,
        fileName: string,
        fd: number,
        resultCB?: (a: Buffer) => Promise<string | void>,
        appendData?: string,
    ): Promise<void> => {
        switch (mode) {
            case FileManagingMode.read:
                const fileInfo = await this.fileInfo(dir, fileName, FSMode.sync);
                const buffer = Buffer.alloc(fileInfo.size);
                switch (permission) {
                    case FileSystemReadingPermission.reading:
                    case FileSystemReadingPermission.readingWriting:
                        const readCB = (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: Buffer): void => {
                            if (!!err) {
                                 this.Logger.log(`File cannot be read.`);
                            }
                            this.Logger.log(`The file contains: ${ bytesRead } bytes.`);
                            if (!!resultCB) {
                                resultCB(buffer);
                            }
                        };
                        await fs.read(fd, buffer, 0, fileInfo.size, 0, readCB);
                        break;
                    case FileSystemReadingPermission.readingSync:
                    case FileSystemReadingPermission.readingWritingSync:
                        await fs.readSync(fd, buffer, 0, fileInfo.size, 0);
                        if (!!resultCB) {
                            resultCB(buffer);
                        }
                        break;
                }
                break;
            case FileManagingMode.write:
                break;
            case FileManagingMode.append:
                await fs.writeSync(fd, appendData);
                break;
        }
    }

    /**
     * openFile
     */
    private openFile = async (
        dir: string,
        fileName: string,
        permission: string,
        mode?: FileManagingMode,
        resultCB?: (a: Buffer) => Promise<string | void>,
        appendString?: string,
    ): Promise<boolean> => {
        if (!dir || !fileName || !permission) {
             this.Logger.log(`Didn't received required arguments to open directory`);
             return false;
        }
        const filePath = path.join(this.getFilesDirectory(), dir, fileName);
        const cb = async (err: NodeJS.ErrnoException | null, fd: number) => {
            if (!!err) {
                return this.Logger.log(`Cannot be opened with ${ permission } permission.`);
            }

            if (mode) {
                await this.readWrite(permission, mode, dir, fileName, fd, resultCB, appendString);
            }
            this.Logger.log(`file (${ fd }) successfully opened!`);
            fs.close(fd, () =>  this.Logger.log(`file closed.`));
        };
        await fs.open(filePath, permission , cb);
        return true;
    }

    /**
     * fileInfo
     */
    private fileInfo = async (
        dir: string,
        fileName: string,
        mode?: FSMode,
        syncCB?: (s: fs.Stats) => Promise<fs.Stats | void>,
    ): Promise<fs.Stats> => {

        if (!dir || !fileName) {
             this.Logger.log(`Didn't received required arguments to open directory`);
             return;
        }

        const filePath = path.join(this.getFilesDirectory(), dir, fileName);
        switch (mode) {
            case FSMode.async:
                const cb = (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
                    if (!!err) {
                        return this.Logger.log(`Check the consistency of the file.`);
                    }
                    syncCB(stats);
                    this.Logger.log(`file read successfully opened!`);
                };
                await fs.stat(filePath, cb);
                break;
            case FSMode.sync:
            default:
                const syncInfo = await fs.statSync(filePath);
                return syncInfo;
        }
    }

    /**
     * readDirectionContent - fetching content from the given directory name
     * @prop directoryName: string
     * return Array<file name>
     */
    private readDirectionContent = async (directoryName: string): Promise<string[]> => {
        const dirFullPath = path.join(this.getFilesDirectory(), directoryName);
        const buf = Buffer.from(dirFullPath);
        try {
            const files: string[] = await fs.readdirSync(buf);
            this.Logger.log(`The directory ${ directoryName } content read successfully.`);
            return files;
        } catch (e) {
             this.Logger.log(`Cannot find directory: ${ directoryName }`);
             return null;
        }
    }

    private createDirectory = async (directoryName: string, mode: FSMode): Promise<boolean> => {
        const dirFullPath = path.join(this.getFilesDirectory(), directoryName);
        try {
            const arrFiles = await this.readDirectionContent(directoryName);
            if (!Array.isArray(arrFiles)) {
                switch (mode) {
                    case FSMode.sync:
                        fs.mkdirSync(dirFullPath, 0o776);
                        return true;
                    case FSMode.async:
                        const mkdirCB = (err: NodeJS.ErrnoException | null): void => {
                            if (err) {
                                 this.Logger.log(`Directory (${ directoryName }) cannot be created.`);
                            }
                        };
                        await fs.mkdir(dirFullPath, mkdirCB);
                        return true;
                }
            }
        } catch (e) {
             this.Logger.log(`Directory (${ directoryName }) cannot be created in ${ mode } mode.`);
             return false;
        }
    }

    private createReadWriteFileStream = async (
        mode: FileManagingMode,
        dir: string,
        fileName: string,
        resultCB?: (a: JSON[] | JSON) => Promise<string | void>,
        data?: string,
    ): Promise<void> => {
        if (!dir || !fileName) {
             this.Logger.log(`Didn't received required arguments to open directory`);
             return;
        }
        const dirFullPath = path.join(this.getFilesDirectory(), dir, fileName);
        switch (mode) {
            case FileManagingMode.write:
                if (!data) {
                     this.Logger.log(`File cannot be written without data provided.`);
                     return;
                }
                const writeStreamEvent = fs.createWriteStream(dirFullPath, { autoClose: true });
                writeStreamEvent.write(data, (err: Error) => {
                    if (err) {
                         this.Logger.log(`Cannot write data.`);
                    }
                    this.Logger.log(`Data was written successfully.`);
                });
                return;
            case FileManagingMode.read:
                const readStreamEvent = fs.createReadStream(dirFullPath, { autoClose: true });
                readStreamEvent.on('data', (data: Buffer) => {
                    try {
                        const jsonData = JSON.parse(data.toString());
                        this.Logger.log(`Data was read successfully.`);
                        resultCB(jsonData);
                    } catch (e) {
                         this.Logger.log(`Cannot read file the format is incorrect.`);
                    }
                });
                return;
            case FileManagingMode.append:
                const appendStreamEvent = fs.createReadStream(dirFullPath, { autoClose: true });
                appendStreamEvent.on('data', (r: Buffer) => {
                    try {
                        const jsonData = JSON.parse(r.toString());
                        if (Array.isArray(jsonData)) {
                            jsonData.push(JSON.parse(data));
                            this.createReadWriteFileStream(FileManagingMode.write, dir, fileName, resultCB, JSON.stringify(jsonData));
                            this.Logger.log(`Data was appended successfully.`);
                            return;
                        }
                    } catch (e) {
                         this.Logger.log(`Cannot read file the format is incorrect.`);
                    }
                });
                return;
        }
    }

    public createReferences = async (directoryName: string, fileName: string, jsonFile: string): Promise<void> => {
        const isDirectoryExists = this.readDirectionContent(directoryName);
        if (!Array.isArray(isDirectoryExists)) {
            await this.createDirectory(directoryName, FSMode.sync);
        }
        const dumbCB = async (a: JSON[] | JSON): Promise<void> => {
             this.Logger.log(`References created successfully.`);
        };
        await this.createReadWriteFileStream(FileManagingMode.write, directoryName, fileName, dumbCB, jsonFile);
    }

    public readReferences = async (directoryName: string, fileName: string, cb: (a: JSON[] | JSON) => Promise<void>): Promise<void> => {
        const isDirectoryExists = this.readDirectionContent(directoryName);
        if (!Array.isArray(isDirectoryExists)) {
           return await this.createReadWriteFileStream(FileManagingMode.read, directoryName, fileName, cb);
        }
        return;
    }
}
