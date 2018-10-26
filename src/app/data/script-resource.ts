export class ScriptResource {
    id: number;
    scriptID: number;
    name: string;
    resourceType: number;
    resourceTypeName: string;
    contents: ResourceContent[];
    isLoaded: boolean;
    isOldType: boolean;
}

export class ResourceContent {
    id: number;
    languageID: number;
    resource: string;
}