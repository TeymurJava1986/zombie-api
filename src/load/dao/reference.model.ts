export interface ReferenceInner {
    name: string;
    endpoint: string;
}

export interface Reference {
    name: string;
    references: ReferenceInner[];
}
