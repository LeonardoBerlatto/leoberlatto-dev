import aboutMd from '@/content/about.md';
import blogMd from '@/content/blog.md';
import projectsMd from '@/content/projects.md';
import socialMd from '@/content/social.md';
import stackMd from '@/content/stack.md';

export const CONTENT = {
  banner: `{{cyan:  _    ___ ___  _  _   _   ___ ___   ___}}
{{cyan: | |  | __/ _ \\| \\| | /_\\ | _ \\   \\ / _ \\}}
{{cyan: | |__| _| (_) | .\` |/ _ \\|   / |) | (_) |}}
{{cyan: |____|___\\___/|_|\\_/_/ \\_\\_|_\\___/ \\___/}}
{{pink:  ___  ___ ___ _      _ _____ _____ ___}}
{{pink: | _ )| __| _ \\ |    /_\\_   _|_   _/ _ \\}}
{{pink: | _ \\| _||   / |__ / _ \\| |   | || (_) |}}
{{pink: |___/|___|_|_\\____/_/ \\_\\_|   |_| \\___/}}
{{green:software engineer}} {{yellow:·}} {{yellow:6+ years of experience}}`,

  about: aboutMd.trim(),

  stack: stackMd.trim(),

    resume: `{{yellow:Resume: 📄}} {{cyan:[resume.pdf](https://drive.google.com/file/d/1ShJlPGo4FJGdbWE0bSKoY8qywgmczb9P/view?usp=sharing)}} {{yellow:— or type gui for the desktop.}}

{{green:Check my projects and stack too!}}`,

  projects: projectsMd.trim(),

  social: socialMd.trim(),

  blog: blogMd.trim(),

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
