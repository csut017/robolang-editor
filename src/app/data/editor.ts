export class Editor {
    name: string;
    isDefault: boolean;

    constructor(name: string, isDefault: boolean = false) {
        this.name = name;
        this.isDefault = isDefault;
    }
}