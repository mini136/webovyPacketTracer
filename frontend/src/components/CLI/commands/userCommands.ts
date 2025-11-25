import type { Command } from '../types';

export const enableCommand: Command = {
  name: 'enable',
  aliases: ['en'],
  description: 'Enter privileged mode',
  mode: 'user',
  execute: () => {
    return {
      output: [''],
      newMode: 'privileged' as const
    };
  }
};

export const exitUserCommand: Command = {
  name: 'exit',
  aliases: [],
  description: 'Exit CLI',
  mode: 'user',
  execute: () => {
    return {
      output: [],
      shouldClose: true
    };
  }
};

export const helpUserCommand: Command = {
  name: 'help',
  aliases: ['?'],
  description: 'Show available commands',
  mode: 'user',
  execute: () => {
    return {
      output: [
        'User mode commands:',
        '  enable - Enter privileged mode',
        '  exit   - Exit CLI',
        ''
      ]
    };
  }
};

export const userCommands: Command[] = [
  enableCommand,
  exitUserCommand,
  helpUserCommand
];
