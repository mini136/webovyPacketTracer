import type { Command, CLIContext, CommandResult, CLIMode } from '../types';
import { userCommands } from './userCommands';
import { privilegedCommands } from './privilegedCommands';
import { configCommands } from './configCommands';
import { interfaceCommands } from './interfaceCommands';
import { windowsCommands } from './windowsCommands';

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  constructor(isWindowsDevice = false) {
    if (isWindowsDevice) {
      this.registerCommands(windowsCommands);
    } else {
      this.registerCommands([
        ...userCommands,
        ...privilegedCommands,
        ...configCommands,
        ...interfaceCommands
      ]);
    }
  }

  private registerCommands(commands: Command[]): void {
    commands.forEach(cmd => {
      // Register main name
      this.commands.set(cmd.name.toLowerCase(), cmd);
      
      // Register aliases
      cmd.aliases?.forEach(alias => {
        this.commands.set(alias.toLowerCase(), cmd);
      });
    });
  }

  public execute(input: string, context: CLIContext): CommandResult {
    const trimmed = input.trim();
    if (!trimmed) {
      return { output: [''] };
    }

    // Split command and arguments
    const parts = trimmed.split(/\s+/);
    const commandName = parts[0].toLowerCase();

    // Try to find command by progressively building the command name
    // (handles multi-word commands like "show running-config")
    let matchedCommand: Command | undefined;
    let matchedLength = 0;

    for (let i = parts.length; i > 0; i--) {
      const potentialCommand = parts.slice(0, i).join(' ').toLowerCase();
      const cmd = this.commands.get(potentialCommand);
      
      if (cmd && this.isCommandAvailableInMode(cmd, context.mode)) {
        matchedCommand = cmd;
        matchedLength = i;
        break;
      }
    }

    if (matchedCommand) {
      const commandArgs = parts.slice(matchedLength);
      return matchedCommand.execute(commandArgs, context);
    }

    return { output: [`% Invalid command: ${commandName}`] };
  }

  private isCommandAvailableInMode(command: Command, mode: CLIMode): boolean {
    if (Array.isArray(command.mode)) {
      return command.mode.includes(mode);
    }
    return command.mode === mode;
  }

  public getCommandsForMode(mode: CLIMode): Command[] {
    const result: Command[] = [];
    const seen = new Set<string>();

    this.commands.forEach((cmd) => {
      // Only add each command once (avoid duplicates from aliases)
      if (!seen.has(cmd.name)) {
        if (this.isCommandAvailableInMode(cmd, mode)) {
          result.push(cmd);
          seen.add(cmd.name);
        }
      }
    });

    return result;
  }
}
