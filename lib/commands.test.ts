import { buildCommands, executeCommand, OutputEntry } from '@/lib/commands';
import { fixtures } from '@/lib/__fixtures__/content';
import { Content } from '@/lib/content';

const content: Content = {
  ...fixtures,
  banner: 'ASCII banner placeholder',
  resume: 'Resume placeholder',
  julia: 'Julia ASCII art placeholder',
};

describe('buildCommands', () => {
  const commands = buildCommands(content);

  it('returns all expected command names', () => {
    const names = Object.keys(commands);
    expect(names).toEqual(
      expect.arrayContaining([
        'about',
        'stack',
        'projects',
        'resume',
        'social',
        'blog',
        'help',
        'clear',
        'julia',
        'banner',
      ]),
    );
  });

  it.each(['about', 'stack', 'projects', 'social'] as const)(
    '%s command returns its content string',
    (name) => {
      const result = commands[name].handler();
      expect(result).toEqual({ content: fixtures[name] });
    },
  );

  it('blog command returns content with openUrl containing Substack URL and 1000ms delay', () => {
    const result = commands.blog.handler();
    expect(result).toMatchObject({
      openUrl: {
        url: expect.stringContaining('substack.com'),
        delay: 1000,
      },
    });
  });

  it('resume command returns resume content', () => {
    const result = commands.resume.handler();
    expect(result).toEqual({ content: content.resume });
  });

  it('help command lists all non-hidden commands with descriptions', () => {
    const result = commands.help.handler() as OutputEntry;
    const visibleCommands = Object.entries(commands).filter(
      ([, cmd]) => !cmd.hidden,
    );

    for (const [name, cmd] of visibleCommands) {
      expect(result.content).toContain(name);
      expect(result.content).toContain(cmd.description);
    }
  });

  it('help command excludes hidden commands', () => {
    const result = commands.help.handler() as OutputEntry;
    const hiddenCommands = Object.entries(commands).filter(
      ([, cmd]) => cmd.hidden,
    );

    for (const [name] of hiddenCommands) {
      expect(result.content).not.toContain(`{{green:${name}}}`);
    }
  });

  it('clear command returns { clear: true }', () => {
    const result = commands.clear.handler();
    expect(result).toMatchObject({ clear: true });
  });

  it('banner command returns { instant: true }', () => {
    const result = commands.banner.handler();
    expect(result).toMatchObject({ instant: true, content: content.banner });
  });

  it('julia command returns { instant: true }', () => {
    const result = commands.julia.handler();
    expect(result).toMatchObject({ instant: true, content: content.julia });
  });
});

describe('executeCommand', () => {
  const commands = buildCommands(content);

  it('resolves known commands case-insensitively', () => {
    const lower = executeCommand('about', commands);
    const upper = executeCommand('ABOUT', commands);
    const mixed = executeCommand('AbOuT', commands);

    expect(lower).toEqual(upper);
    expect(lower).toEqual(mixed);
  });

  it('returns "Command not found" for unknown input', () => {
    const result = executeCommand('nonexistent', commands);
    expect(result).toHaveProperty('content');
    expect((result as { content: string }).content).toContain(
      'Command not found',
    );
  });

  it('trims whitespace from input', () => {
    const trimmed = executeCommand('about', commands);
    const withSpaces = executeCommand('  about  ', commands);

    expect(trimmed).toEqual(withSpaces);
  });
});
