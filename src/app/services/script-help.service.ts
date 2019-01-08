import { Injectable } from '@angular/core';

export class HelpInfo {
  title: string;
  description: string;
  requireChildren: boolean;
  arguments: FunctionArgument[] = [];
  children: Child[] = [];
  parents: string[] = [];
  hasArguments: boolean = false;
  hasChildren: boolean = false;
  hasParents: boolean = false;
  isServer: boolean = false;
  isRoot: boolean = true;

  constructor(title: string, desc: string, requireChildren?: boolean) {
    this.title = title;
    this.description = desc;
    this.requireChildren = !!requireChildren;
  }

  addArgument(name: string, type: string, required?: boolean): HelpInfo {
    var arg = new FunctionArgument(name, type);
    arg.isRequired = !!required;
    this.arguments.push(arg);
    this.hasArguments = true;
    return this;
  }

  addChild(name: string, number: string): HelpInfo {
    var child = new FunctionChild(name, number);
    this.children.push(child);
    this.hasChildren = true;
    return this;
  }

  addResourceChild(number: string): HelpInfo {
    var child = new ResourceChild(number);
    this.children.push(child);
    this.hasChildren = true;
    return this;
  }

  addParent(name: string): HelpInfo {
    this.parents.push(name);
    this.hasParents = true;
    this.isRoot = !!this.parents.find(p => p == '-');
    return this;
  }

  setIsServer(): HelpInfo {
    this.isServer = true;
    return this;
  }

  checkIsChildOf(name: string): boolean {
    return !!this.parents.find(p => p == name);
  }
}

export class FunctionArgument {
  name: string;
  type: string;
  isRequired: boolean;

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }
}

export interface Child {
  number: string;
  type: string;
}

export class FunctionChild implements Child {
  name: string;
  number: string;
  type: string = 'Function';

  constructor(name: string, number: string) {
    this.name = name;
    this.number = number;
  }
}

export class ResourceChild implements Child {
  number: string;
  type: string = 'Resource';

  constructor(number: string) {
    this.number = number;
  }
}

const ArgumentType = {
  String: 'TEXT' as 'TEXT',
  Number: 'NUMBER' as 'NUMBER',
  Variable: 'VARIABLE' as 'VARIABLE',
  Boolean: 'TRUE/FALSE' as 'TRUE/FALSE',
  Time: 'TIME' as 'TIME',
  Type: 'TYPE' as 'TYPE',
  Any: 'ANY' as 'ANY'
}
type ArgumentType = (typeof ArgumentType)[keyof typeof ArgumentType];

const ChildNumber = {
  One: '1' as '1',
  OneOrZero: '0..1' as '0..1',
  OneOrMore: '1..*' as '1..*',
  ZeroOrMore: '0..*' as '0..*',
}
type ChildNumber = (typeof ChildNumber)[keyof typeof ChildNumber];

@Injectable({
  providedIn: 'root'
})
export class ScriptHelpService {

  private help: HelpInfo[];

  constructor() {
    this.help = [
      new HelpInfo('add', 'Adds a number to a variable')
        .addArgument('variable', ArgumentType.Variable, true)
        .addArgument('number', ArgumentType.Number, true),
      new HelpInfo('after', 'Performs the children after a set number of repetitions')
        .addArgument('repetitions', ArgumentType.Number, true)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('repeat'),
      new HelpInfo('arrived', 'Performs the children when the robot has arrived at the location')
        .addArgument('location', ArgumentType.String)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('moveTo'),
      new HelpInfo('blocked', 'Performs the children if the robot\'s movement is blocked')
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('moveTo'),
      new HelpInfo('call', 'Starts another script')
        .addArgument('script', ArgumentType.String, true),
      new HelpInfo('choice', 'An option that can be performed')
        .addArgument('weighting', ArgumentType.Number)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('random'),
      new HelpInfo('clearScreen', 'Clears the screen'),
      new HelpInfo('concat', 'Concatenates a string to a variable')
        .addArgument('variable', ArgumentType.Variable, true)
        .addArgument('value', ArgumentType.String, true),
      new HelpInfo('default', 'A default action to perform')
        .addArgument('variable', ArgumentType.Variable)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('switch')
        .addParent('wait'),
      new HelpInfo('defaultValue', 'Defines a default value for any functions.')
        .addArgument('function', ArgumentType.String, true)
        .addArgument('argument', ArgumentType.String, true)
        .addArgument('value', ArgumentType.Any, true)
        .addParent('-')
        .setIsServer(),
      new HelpInfo('doNothing', 'Does nothing'),
      new HelpInfo('equal', 'Checks if the condition matches the input.')
        .addArgument('condition', ArgumentType.Any, true)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('switch'),
      new HelpInfo('forEach', 'Iterates over a list and executes the children for each item.')
        .addArgument('source', ArgumentType.Any, true)
        .addArgument('variable', ArgumentType.Variable)
        .addChild('*', ChildNumber.OneOrMore),
      new HelpInfo('function', 'Defines a new function.')
        .addArgument('name', ArgumentType.String, true)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('-'),
      new HelpInfo('greater', 'Checks if the condition is greater than the input.')
        .addArgument('condition', ArgumentType.Any, true)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('switch'),
      new HelpInfo('language', 'Defines a resource in a language.')
        .addArgument('name', ArgumentType.String, true)
        .addResourceChild(ChildNumber.One)
        .addParent('resource'),
      new HelpInfo('less', 'Checks if the condition is less than the the input.')
        .addArgument('condition', ArgumentType.Any, true)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('switch'),
      new HelpInfo('lookAtPerson', 'Looks at a person.')
        .addArgument('person', ArgumentType.String)
        .addArgument('track', ArgumentType.Boolean),
      new HelpInfo('loop', 'Performs the children a set number of times.')
        .addArgument('iterations', ArgumentType.Number)
        .addChild('*', ChildNumber.OneOrMore),
      new HelpInfo('moveTo', 'Moves to a location.')
        .addArgument('location', ArgumentType.String, true)
        .addChild('arrived', ChildNumber.OneOrZero)
        .addChild('blocked', ChildNumber.OneOrZero),
      new HelpInfo('parameter', 'Defines a parameter for the script')
        .addArgument('name', ArgumentType.String, true)
        .addArgument('type', ArgumentType.Type, true)
        .addArgument('split', ArgumentType.Boolean)
        .addArgument('required', ArgumentType.Boolean)
        .addParent('-')
        .addParent('function')
        .setIsServer(),
      new HelpInfo('play', 'Plays an external resource (audio or video).')
        .addArgument('movement', ArgumentType.String)
        .addArgument('sound', ArgumentType.String)
        .addArgument('wait', ArgumentType.Boolean),
      new HelpInfo('random', 'Randomly chooses an option.')
        .addChild('choice', ChildNumber.OneOrMore),
      new HelpInfo('record', 'Records an event.')
        .addArgument('log', ArgumentType.String, true)
        .addArgument('event', ArgumentType.String, true)
        .addArgument('status', ArgumentType.String)
        .addArgument('value', ArgumentType.Any),
      new HelpInfo('repeat', 'Repeats the current block.')
        .addChild('after', ChildNumber.ZeroOrMore),
      new HelpInfo('reschedule', 'Reschedules the script after time has elapsed.')
        .addArgument('time', ArgumentType.Time, true),
      new HelpInfo('resource', 'Defines a resource for the script')
        .addArgument('name', ArgumentType.String, true)
        .addArgument('type', ArgumentType.Type, true)
        .addArgument('language', ArgumentType.String)
        .addParent('-')
        .addChild('language', ChildNumber.ZeroOrMore)
        .addResourceChild(ChildNumber.OneOrZero)
        .setIsServer(),
      new HelpInfo('response', 'Checks the user input to match a value.')
        .addArgument('text', ArgumentType.String, true)
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('wait'),
      new HelpInfo('say', 'Speaks the speech.')
        .addArgument('speech', ArgumentType.String, true)
        .addArgument('pattern', ArgumentType.String)
        .addArgument('wait', ArgumentType.Boolean),
      new HelpInfo('select', 'Selects an item from a set of options.')
        .addArgument('variable', ArgumentType.Variable)
        .addArgument('from', ArgumentType.Any, true),
      new HelpInfo('sensor', 'Checks a sensor value')
        .addArgument('name', ArgumentType.String, true)
        .addArgument('greater', ArgumentType.Any)
        .addArgument('less', ArgumentType.Any)
        .addArgument('equal', ArgumentType.Any)
        .addArgument('in', ArgumentType.Any)
        .addChild('*', ChildNumber.OneOrMore),
      new HelpInfo('showScreen', 'Displays a screen.')
        .addArgument('screen', ArgumentType.String, true)
        .addArgument('say', ArgumentType.Boolean),
      new HelpInfo('switch', 'Chooses between one or more items', true)
        .addArgument('value', ArgumentType.Any, true)
        .addChild('default', ChildNumber.OneOrZero)
        .addChild('equal', ChildNumber.ZeroOrMore)
        .addChild('greater', ChildNumber.ZeroOrMore)
        .addChild('less', ChildNumber.ZeroOrMore),
      new HelpInfo('timeout', 'Performs the children when the wait times out.')
        .addChild('*', ChildNumber.OneOrMore)
        .addParent('wait'),
      new HelpInfo('variable', 'Defines or updates a variable.')
        .addArgument('name', ArgumentType.String, true)
        .addArgument('value', ArgumentType.Any)
        .addArgument('server', ArgumentType.Boolean)
        .addArgument('default', ArgumentType.Any),
      new HelpInfo('wait', 'Waits for user input or a timeout.', true)
        .addArgument('timeout', ArgumentType.Time)
        .addArgument('priority', ArgumentType.Number)
        .addChild('response', ChildNumber.ZeroOrMore)
        .addChild('default', ChildNumber.OneOrZero)
        .addChild('timeout', ChildNumber.OneOrZero),
      new HelpInfo('waitFor', 'Waits for a period of time and then performs the children.')
        .addArgument('time', ArgumentType.Time, true),
      new HelpInfo('when', 'Responds to an external event (e.g. a sensor).')
        .addArgument('timeout', ArgumentType.Time)
        .addArgument('priority', ArgumentType.Number)
        .addChild('sensor', ChildNumber.OneOrMore)
    ];
    this.help.sort((a, b) => a.title == b.title ? 0 : (a.title > b.title ? 1 : -1));
  }

  getAll(): HelpInfo[] {
    return this.help;
  }
}
