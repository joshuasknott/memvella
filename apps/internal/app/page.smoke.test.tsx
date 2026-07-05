import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MissionControlPage from './page';

describe('Memvella HQ home route', () => {
  it('renders the minimal authenticated HQ surface', async () => {
    const markup = renderToStaticMarkup(await MissionControlPage());

    expect(markup).toContain('Memvella HQ');
    expect(markup).toContain('HQ enabled');
    expect(markup).toContain('restricted access');
    expect(markup).toContain('Access gate');
    expect(markup).toContain('No dashboards');
    expect(markup).toContain('Open product app');
    expect(markup).toContain('Open marketing app');
  });
});
