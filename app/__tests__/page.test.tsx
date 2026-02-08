import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home", () => {
  it("renders the heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /to get started, edit the page\.tsx file\./i,
      })
    ).toBeInTheDocument();
  });

  it("renders deploy and documentation links", () => {
    render(<Home />);

    expect(screen.getByText("Deploy Now")).toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();
  });
});
