import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import SearchableCountrySelect from "../SearchableCountrySelect";

describe("SearchableCountrySelect", () => {
  const defaultProps = {
    id: "country-select",
    label: "Country",
    value: "US",
    onChange: vi.fn(),
  };

  it("renders label and display value", () => {
    render(<SearchableCountrySelect {...defaultProps} />);
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/United States \(US\)/i)).toBeInTheDocument();
  });

  it("shows dropdown when input is focused", () => {
    render(<SearchableCountrySelect {...defaultProps} />);
    const input = screen.getByLabelText(/Country/i);
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /United States \(US\)/i })).toBeInTheDocument();
  });

  it("calls onChange when option is selected", () => {
    const onChange = vi.fn();
    render(<SearchableCountrySelect {...defaultProps} onChange={onChange} />);
    fireEvent.focus(screen.getByLabelText(/Country/i));
    fireEvent.click(screen.getByRole("option", { name: /France \(FR\)/i }));
    expect(onChange).toHaveBeenCalledWith("FR");
  });

  it("filters countries by search", () => {
    render(<SearchableCountrySelect {...defaultProps} />);
    fireEvent.focus(screen.getByLabelText(/Country/i));
    const input = screen.getByPlaceholderText(/Search country/i);
    fireEvent.change(input, { target: { value: "fran" } });
    expect(screen.getByRole("option", { name: /France \(FR\)/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /United States \(US\)/i })).not.toBeInTheDocument();
  });

  it("shows no country found when search has no match", () => {
    render(<SearchableCountrySelect {...defaultProps} />);
    fireEvent.focus(screen.getByLabelText(/Country/i));
    fireEvent.change(screen.getByPlaceholderText(/Search country/i), {
      target: { value: "xyz123" },
    });
    expect(screen.getByText(/No country found/i)).toBeInTheDocument();
  });

  it("toggles dropdown with button", () => {
    render(<SearchableCountrySelect {...defaultProps} />);
    const toggle = screen.getByRole("button", { name: /Toggle dropdown/i });
    fireEvent.click(toggle);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
