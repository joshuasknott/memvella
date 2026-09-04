import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ContactPage from "./contact/page";
import MarketingHomePage from "./page";
import PrivacyPolicyPage from "./privacy/page";
import TermsOfServicePage from "./terms/page";

describe("marketing public routes", () => {
  it("renders the home page key content and waitlist form affordances", () => {
    const markup = renderToStaticMarkup(<MarketingHomePage />);

    expect(markup).toContain("Their stories.");
    expect(markup).toContain("Join the waitlist");
    expect(markup).toContain("Email address");
    expect(markup).toContain("Workspace");
    expect(markup).toContain("companion tablet");
  });

  it("renders contact with a direct email action instead of a broken API post", () => {
    const markup = renderToStaticMarkup(<ContactPage />);

    expect(markup).toContain("Contact Us");
    expect(markup).toContain("Your name");
    expect(markup).toContain("Email address");
    expect(markup).toContain("Message");
    expect(markup).toContain("Send email");
    expect(markup).toContain('action="mailto:hello@memvella.com"');
    expect(markup).not.toContain("/api/contact");
  });

  it("renders privacy and terms pages", () => {
    const privacyMarkup = renderToStaticMarkup(<PrivacyPolicyPage />);
    const termsMarkup = renderToStaticMarkup(<TermsOfServicePage />);

    expect(privacyMarkup).toContain("Privacy Policy");
    expect(privacyMarkup).toContain("digital wellness companion");
    expect(privacyMarkup).toContain("privacy@memvella.com");
    expect(termsMarkup).toContain("Terms of Service");
    expect(termsMarkup).toContain("not a medical device");
    expect(termsMarkup).toContain("hello@memvella.com");
  });
});
