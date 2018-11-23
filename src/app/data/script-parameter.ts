export class ScriptParameter {
    id: number;
    scriptID: number;
    name: string;
    flags: number;
    dataType: number;
    dataTypeName: string;

    // Flags
    isRequired: boolean;
    isSplit: boolean;
    isGenerated: boolean;

    // Flag packing and unpacking
    static pack(parameter: ScriptParameter): void {
        const baseFlags = parameter.flags & 65472;
        parameter.flags = baseFlags
            + (parameter.isRequired ? 1 : 0)
            + (parameter.isSplit ? 2 : 0);
    }

    static unpack(parameter: ScriptParameter): void {
        parameter.isRequired = !!(parameter.flags & 1);
        parameter.isSplit = !!(parameter.flags & 2);
        parameter.isGenerated = !!(parameter.flags & 64);
    }
}
