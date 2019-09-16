export interface IFileRoute {
    [k: string]: string;
}

const FileRoutes: IFileRoute = {
    referencesDir: 'references',
    referencesFile: 'references.json',
};

export default FileRoutes;