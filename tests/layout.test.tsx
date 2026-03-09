import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "../app/layout";

describe("RootLayout", () => {
  test("wraps children within the Papirus desktop shell", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div data-testid="child">Child node</div>
      </RootLayout>
    );

    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(markup, "text/html");
    const body = documentFragment.body;

    expect(body).not.toBeNull();
    expect(body.classList.contains("papirus-desktop")).toBe(true);
    expect(documentFragment.querySelector('[data-testid="child"]')).not.toBeNull();
  });
});
