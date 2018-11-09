import { ScriptParameter } from './script-parameter'
import { ScriptResource } from './script-resource'
import { ScriptVersion } from './script-version';
import { RobotScript } from './robot-script';

export class Script {
    id: number;
    name: string;
    description: string;
    script: string;
    parameters: ScriptParameter[];
    resources: ScriptResource[];
    isLoaded: boolean;
    original: Script;
    flags: number;
    format: number;
    category: number;
    categoryName: string;
    groupName: string;
    isNew: boolean;
    isAdding: boolean;
    versions: ScriptVersion[];

    // Flags
    isObsolete: boolean;
    isInactive: boolean;

    // Temporary storage for deleted items
    deletedParameters: ScriptParameter[];
    deletedResources: ScriptResource[];

    // Flag packing and unpacking
    static pack(script: Script): void {
        script.flags = (script.isObsolete ? 1 : 0)
            + (script.isInactive ? 2 : 0);
    }

    static unpack(script: Script): void {
        script.isObsolete = !!(script.flags & 1);
        script.isInactive = !!(script.flags & 2);
    }

    static from(robotScript: RobotScript): Script {
        let out = new Script();
        out.name = robotScript.name;
        out.script = robotScript.script;
        return out;
    }
}