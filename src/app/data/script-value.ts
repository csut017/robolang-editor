import { Language } from "./language";

export class ScriptValue {
    id: number;
    value: string;
}

export class ScriptSettings {
    categories: ScriptValue[];
    dataTypes: ScriptValue[];
    resourceTypes: ScriptValue[];
    languages: Language[];

    findCategory(id: number): ScriptValue {
        const category = this.categories.find(cat => cat.id == id);
        return category;
    }

    findDataType(id: number): ScriptValue {
        const dataType = this.dataTypes.find(dt => dt.id == id);
        return dataType;
    }

    findResourceType(id: number): ScriptValue {
        const resType = this.resourceTypes.find(rt => rt.id == id);
        return resType;
    }
}