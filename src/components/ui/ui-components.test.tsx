import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

describe("UI primitives", () => {
  it("renders badge and button variants", () => {
    render(
      <>
        <Badge>Default badge</Badge>
        <Badge variant="outline" className="custom-badge">
          Outline badge
        </Badge>
        <Button>Default button</Button>
        <Button variant="destructive" size="lg" className="custom-button">
          Delete
        </Button>
      </>,
    );

    expect(screen.getByText("Default badge")).toHaveAttribute("data-slot", "badge");
    expect(screen.getByText("Outline badge")).toHaveClass("custom-badge");
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("custom-button");
    expect(buttonVariants({ variant: "link", size: "icon" })).toContain("underline-offset-4");
  });

  it("renders card structure and form controls", () => {
    render(
      <Card size="sm" className="card">
        <CardHeader className="header">
          <CardTitle className="title">Profile</CardTitle>
        </CardHeader>
        <CardContent className="content">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="input" />
          <Separator orientation="vertical" className="separator" />
        </CardContent>
      </Card>,
    );

    expect(screen.getByText("Profile")).toHaveAttribute("data-slot", "card-title");
    expect(screen.getByText("Profile").closest("[data-slot=card]")).toHaveAttribute(
      "data-size",
      "sm",
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByRole("separator")).toHaveAttribute("data-orientation", "vertical");
  });
});
