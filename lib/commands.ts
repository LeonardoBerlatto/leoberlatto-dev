import { CONTENT } from './content';

export type OutputEntry = {
  content: string;
  instant?: boolean;
  clear?: boolean;
};

export type Command = {
  description: string;
  handler: (args?: string, history?: string[]) => OutputEntry;
};

export const COMMANDS: Record<string, Command> = {
  about: {
    description: 'View information about me',
    handler: () => ({
      content: CONTENT.about,
    }),
  },
  stack: {
    description: 'View my tech stack',
    handler: () => ({
      content: CONTENT.stack,
    }),
  },
  projects: {
    description: 'View my projects',
    handler: () => ({
      content: CONTENT.projects,
    }),
  },
  resume: {
    description: 'View my resume',
    handler: () => ({
      content: CONTENT.resume,
    }),
  },
  social: {
    description: 'View my social links',
    handler: () => ({
      content: CONTENT.social,
    }),
  },
  email: {
    description: 'Get in touch',
    handler: () => ({
      content: CONTENT.email,
    }),
  },
  blog: {
    description: 'View my blog articles',
    handler: () => ({
      content: CONTENT.blog,
    }),
  },
  help: {
    description: 'List all available commands',
    handler: () => {
      const commandList = Object.entries(COMMANDS)
        .map(([name, cmd]) => `{{green:${name}}} - ${cmd.description}`)
        .join('\n');
      return {
        content: commandList,
      };
    },
  },
  clear: {
    description: 'Clear the terminal',
    handler: () => ({
      clear: true,
      content: '',
    }),
  },
  banner: {
    description: 'Display the banner',
    handler: () => ({
      content: CONTENT.banner,
      instant: true,
    }),
  },
  history: {
    description: 'View command history',
    handler: (args?: string, history?: string[]) => {
      if (!history || history.length === 0) {
        return {
          content: 'No command history',
          instant: true,
        };
      }
      const historyList = history
        .map((cmd, index) => `${index + 1}. ${cmd}`)
        .join('\n');
      return {
        content: historyList,
        instant: true,
      };
    },
  },
};

export function executeCommand(
  input: string,
  history?: string[]
): OutputEntry {
  const commandName = input.trim().toLowerCase();

  if (COMMANDS[commandName]) {
    return COMMANDS[commandName].handler(input, history);
  }

  return {
    content: `Command not found: {{yellow:${input}}}. Type {{green:help}} to see available commands.`,
  };
}
