import { describe, expect, it, vi } from 'vitest';
import { syncWebDocumentPresentation } from './webDocumentPresentation';

describe('syncWebDocumentPresentation', () => {
  it('paints the document chrome with the theme background', () => {
    const setAttribute = vi.fn();
    const appendChild = vi.fn();
    const querySelector = vi.fn().mockReturnValue(null);
    const createElement = vi.fn().mockReturnValue({ setAttribute });
    vi.stubGlobal('document', {
      documentElement: { style: {} },
      body: { style: {} },
      head: { appendChild },
      querySelector,
      createElement,
    });

    syncWebDocumentPresentation('#181a1f');

    const doc = document as unknown as {
      documentElement: { style: Record<string, string> };
      body: { style: Record<string, string> };
    };
    expect(doc.documentElement.style.backgroundColor).toBe('#181a1f');
    expect(doc.body.style.backgroundColor).toBe('#181a1f');
    expect(createElement).toHaveBeenCalledWith('meta');
    expect(setAttribute).toHaveBeenCalledWith('content', '#181a1f');
    vi.unstubAllGlobals();
  });

  it('reuses an existing theme-color meta', () => {
    const existing = { setAttribute: vi.fn() };
    vi.stubGlobal('document', {
      documentElement: { style: {} },
      body: { style: {} },
      head: { appendChild: vi.fn() },
      querySelector: vi.fn().mockReturnValue(existing),
      createElement: vi.fn(),
    });

    syncWebDocumentPresentation('#ffffff');

    expect(existing.setAttribute).toHaveBeenCalledWith('content', '#ffffff');
    vi.unstubAllGlobals();
  });
});
