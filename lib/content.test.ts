import { buildContent } from "@/lib/content";
import { fixtures } from "@/lib/__fixtures__/content";

describe("buildContent", () => {
  it("merges static content with file content", () => {
    const content = buildContent(fixtures);

    expect(content.banner).toBeDefined();
    expect(content.resume).toBeDefined();
    expect(content.julia).toBeDefined();
    expect(content.about).toBe(fixtures.about);
    expect(content.stack).toBe(fixtures.stack);
    expect(content.projects).toBe(fixtures.projects);
    expect(content.social).toBe(fixtures.social);
    expect(content.blog).toBe(fixtures.blog);
  });

  it("trims leading and trailing whitespace from file content", () => {
    const content = buildContent({
      about: "  padded about  ",
      stack: "\n  padded stack\n",
      projects: "\tpadded projects\t",
      social: "  padded social\n",
      blog: "\n  padded blog  \n",
    });

    expect(content.about).toBe("padded about");
    expect(content.stack).toBe("padded stack");
    expect(content.projects).toBe("padded projects");
    expect(content.social).toBe("padded social");
    expect(content.blog).toBe("padded blog");
  });

  it("preserves static content as-is", () => {
    const content = buildContent(fixtures);

    expect(content.banner).toContain("{{cyan:");
    expect(content.resume).toContain("resume.pdf");
    expect(content.julia).toContain("{{pink:");
  });
});
