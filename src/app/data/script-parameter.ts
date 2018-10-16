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

    // Flag packing and unpacking
    static pack(parameter: ScriptParameter): void {
        parameter.flags = (parameter.isRequired ? 1 : 0)
            + (parameter.isSplit ? 2 : 0);
    }

    static unpack(parameter: ScriptParameter): void {
        parameter.isRequired = !!(parameter.flags & 1);
        parameter.isSplit = !!(parameter.flags & 2);
    }
}
