export type Content = typeof STATIC_CONTENT & {
  about: string;
  stack: string;
  projects: string;
  social: string;
  blog: string;
};

const STATIC_CONTENT = {
  banner: `{{cyan: _    ___ ___  _  _   _   ___ ___   ___}}
{{cyan:| |  | __/ _ \\| \\| | /_\\ | _ \\   \\ / _ \\}}
{{cyan:| |__| _| (_) | .\` |/ _ \\|   / |) | (_) |}}
{{cyan:|____|___\\___/|_|\\_/_/ \\_\\_|_\\___/ \\___/}}
{{pink: ___  ___ ___ _      _ _____ _____ ___}}
{{pink:| _ )| __| _ \\ |    /_\\_   _|_   _/ _ \\}}
{{pink:| _ \\| _||   / |__ / _ \\| |   | || (_) |}}
{{pink:|___/|___|_|_\\____/_/ \\_\\_|   |_| \\___/}}
{{green:software engineer}} {{yellow:·}} {{yellow:6+ years of experience}}`,

  resume: `{{yellow:Resume: 📄}} {{cyan:[resume.pdf](https://drive.google.com/file/d/1ShJlPGo4FJGdbWE0bSKoY8qywgmczb9P/view?usp=sharing)}} {{yellow:— or type gui for the desktop.}}

{{green:Check my projects and stack too!}}`,

  julia: `{{pink:     _ _   _ _     _    _}}
{{pink:    | | | | | |   | |  / \\}}
{{pink:    | | | | | |   | | / _ \\}}
{{pink: _  | | | | | |   | |/ ___ \\}}
{{pink:| |_| | |_| | |__ | / /   \\ \\}}
{{pink: \\___/ \\___/|____|_/_/     \\_\\}}

{{red:    ___     ___}}
{{red:   /   \\   /   \\}}
{{red:  |     \\ /     |}}
{{red:   \\           /}}
{{red:    \\         /}}
{{red:     \\       /}}
{{red:      \\     /}}
{{red:       \\   /}}
{{red:        \\ /}}
{{red:         V}}

{{pink: _____ ___    _   __  __  ___}}
{{pink:|_   _| __|  /_\\ |  \\/  |/ _ \\}}
{{pink:  | | | _|  / _ \\| |\\/| | (_) |}}
{{pink:  |_| |___|/_/ \\_\\_|  |_|\\___/}}`,
};

export function buildContent(files: {
  about: string;
  stack: string;
  projects: string;
  social: string;
  blog: string;
}): Content {
  return {
    ...STATIC_CONTENT,
    about: files.about.trim(),
    stack: files.stack.trim(),
    projects: files.projects.trim(),
    social: files.social.trim(),
    blog: files.blog.trim(),
  };
}
