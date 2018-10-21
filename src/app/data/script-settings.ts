import { ScriptValue } from "./script-value";
import { Language } from "./language";
import { Editor } from "./editor";

export class ScriptSettings {
    categories: ScriptValue[];
    dataTypes: ScriptValue[];
    resourceTypes: ScriptValue[];
    languages: Language[];
    editors: Editor[];

    constructor() {
        this.editors = [
            new Editor('text', true)
        ];
    }

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