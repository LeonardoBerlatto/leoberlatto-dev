import { CONTENT } from './content';

export type OutputEntry = {
  content: string;
  instant?: boolean;
  clear?: boolean;
  openUrl?: {
    url: string;
    delay?: number;
  };
};

export type Command = {
  description: string;
  hidden?: boolean;
  handler: (args?: string) => OutputEntry | Promise<OutputEntry>;
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
  blog: {
    description: 'Open my blog on Substack',
    handler: () => ({
      content: '{{green:Opening Substack in a new tab...}}',
      openUrl: {
        url: 'https://substack.com/@leonardoberlatto?',
        delay: 1000,
      },
    }),
  },
  help: {
    description: 'List all available commands',
    handler: () => {
      const commandList = Object.entries(COMMANDS)
        .filter(([, cmd]) => !cmd.hidden)
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
  julia: {
    description: '',
    hidden: true,
    handler: () => ({
      content: CONTENT.julia,
      instant: true,
    }),
  },
  banner: {
    description: 'Display the banner',
    handler: () => ({
      content: CONTENT.banner,
      instant: true,
    }),
  },
};

export async function executeCommand(input: string): Promise<OutputEntry> {
  const commandName = input.trim().toLowerCase();

  if (COMMANDS[commandName]) {
    return COMMANDS[commandName].handler(input);
  }

  return {
    content: `Command not found: {{yellow:${input}}}. Type {{green:help}} to see available commands.`,
  };
}
