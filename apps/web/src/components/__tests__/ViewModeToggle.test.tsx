import { render, screen, fireEvent } from "@testing-library/react";
import { ViewModeToggle } from "../ViewModeToggle";

describe("ViewModeToggle", () => {
  it("renders list and card view buttons", () => {
    render(<ViewModeToggle value="list" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /List view/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Card view/i })).toBeInTheDocument();
  });

  it("calls onChange with list when list button clicked", () => {
    const onChange = vi.fn();
    render(<ViewModeToggle value="cards" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /List view/i }));
    expect(onChange).toHaveBeenCalledWith("list");
  });

  it("calls onChange with cards when card button clicked", () => {
    const onChange = vi.fn();
    render(<ViewModeToggle value="list" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Card view/i }));
    expect(onChange).toHaveBeenCalledWith("cards");
  });
});
