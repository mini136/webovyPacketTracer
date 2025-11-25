import type { Command } from '../types';
import { showCommands } from './showCommands';

export const configureTerminalCommand: Command = {
  name: 'configure terminal',
  aliases: ['conf t'],
  description: 'Enter configuration mode',
  mode: 'privileged',
  execute: () => {
    return {
      output: ['Enter configuration commands, one per line. End with CNTL/Z.'],
      newMode: 'config' as const
    };
  }
};

export const disableCommand: Command = {
  name: 'disable',
  aliases: [],
  description: 'Return to user mode',
  mode: 'privileged',
  execute: () => {
    return {
      output: [''],
      newMode: 'user' as const
    };
  }
};

export const exitPrivilegedCommand: Command = {
  name: 'exit',
  aliases: [],
  description: 'Return to user mode',
  mode: 'privileged',
  execute: () => {
    return {
      output: [''],
      newMode: 'user' as const
    };
  }
};

export const helpPrivilegedCommand: Command = {
  name: 'help',
  aliases: ['?'],
  description: 'Show available commands',
  mode: 'privileged',
  execute: (_args, context) => {
    const baseCommands = [
      '  configure terminal       - Enter configuration mode',
      '  show running-config      - Show running configuration',
      '  show ip interface brief  - Show interface status',
      '  show ip route            - Show routing table',
      '  disable                  - Return to user mode',
    ];
    
    const switchCommands = context.device.data.type === 'switch' ? [
      '  show vlan brief          - Show VLAN configuration',
      '  show interfaces trunk    - Show trunk port information',
    ] : [];
    
    return {
      output: [
        'Privileged mode commands:',
        ...baseCommands,
        ...switchCommands,
        ''
      ]
    };
  }
};

export const privilegedCommands: Command[] = [
  configureTerminalCommand,
  disableCommand,
  exitPrivilegedCommand,
  helpPrivilegedCommand,
  ...showCommands
];
