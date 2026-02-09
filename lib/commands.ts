import { Content } from './content';

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

export function buildCommands(content: Content): Record<string, Command> {
  const commands: Record<string, Command> = {
    about: {
      description: 'View information about me',
      handler: () => ({ content: content.about }),
    },
    stack: {
      description: 'View my tech stack',
      handler: () => ({ content: content.stack }),
    },
    projects: {
      description: 'View my projects',
      handler: () => ({ content: content.projects }),
    },
    resume: {
      description: 'View my resume',
      handler: () => ({ content: content.resume }),
    },
    social: {
      description: 'View my social links',
      handler: () => ({ content: content.social }),
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
        const commandList = Object.entries(commands)
          .filter(([, cmd]) => !cmd.hidden)
          .map(([name, cmd]) => `{{green:${name}}} - ${cmd.description}`)
          .join('\n');
        return { content: commandList };
      },
    },
    clear: {
      description: 'Clear the terminal',
      handler: () => ({ clear: true, content: '' }),
    },
    julia: {
      description: '',
      hidden: true,
      handler: () => ({ content: content.julia, instant: true }),
    },
    banner: {
      description: 'Display the banner',
      handler: () => ({ content: content.banner, instant: true }),
    },
  };

  return commands;
}

export function executeCommand(
  input: string,
  commands: Record<string, Command>,
): OutputEntry | Promise<OutputEntry> {
  const commandName = input.trim().toLowerCase();

  if (commands[commandName]) {
    return commands[commandName].handler(input);
  }

  return {
    content: `Command not found: {{yellow:${input}}}. Type {{green:help}} to see available commands.`,
  };
}
