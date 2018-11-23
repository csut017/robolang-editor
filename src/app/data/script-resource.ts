export class ScriptResource {
    id: number;
    scriptID: number;
    name: string;
    resourceType: number;
    resourceTypeName: string;
    contents: ResourceContent[];
    isLoaded: boolean;
    isOldType: boolean;
    flags: number;

    // Flags
    isGenerated: boolean;

    // Flag packing and unpacking
    static pack(resource: ScriptResource): void {
        const baseFlags = resource.flags & 65472;
        resource.flags = baseFlags;
    }

    static unpack(resource: ScriptResource): void {
        resource.isGenerated = !!(resource.flags & 64);
    }
}

export class ResourceContent {
    id: number;
    languageID: number;
    resource: string;
}