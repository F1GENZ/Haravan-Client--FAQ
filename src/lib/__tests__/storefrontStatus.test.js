import { describe, expect, it } from 'vitest';
import { snippetStatusView, themeDisplayName } from '../storefrontStatus';

describe('themeDisplayName', () => {
  it('returns the first non-empty name', () => {
    expect(themeDisplayName('', '  ', 'Sartor')).toBe('Sartor');
    expect(themeDisplayName('Theme A', 'Theme B')).toBe('Theme A');
    expect(themeDisplayName(undefined, null)).toBe('');
  });
});

describe('snippetStatusView', () => {
  it('asks for a primary install when no snippet exists', () => {
    const view = snippetStatusView({ installed: false, themeName: 'Sartor' });
    expect(view.actionLabel).toBe('Cài vào theme');
    expect(view.actionType).toBe('primary');
    expect(view.needsUpdate).toBe(false);
    expect(view.sentence).toBe('Snippet chưa được cài trên theme Sartor.');
  });

  it('treats an installed latest snippet as a secondary reinstall', () => {
    const view = snippetStatusView({
      installed: true,
      version: '6',
      latestVersion: '6',
      themeName: 'Sartor',
    });
    expect(view.needsUpdate).toBe(false);
    expect(view.actionLabel).toBe('Cài lại');
    expect(view.actionType).toBe('default');
    expect(view.sentence).toBe(
      'Snippet v6 đã cài, đang là bản mới nhất trên theme Sartor.'
    );
  });

  it('compares numeric versions as strings from the API', () => {
    const view = snippetStatusView({ installed: true, version: 5, latestVersion: 6 });
    expect(view.needsUpdate).toBe(true);
    expect(view.actionLabel).toBe('Cập nhật');
    expect(view.actionType).toBe('primary');
    expect(view.sentence).toContain('bản mới v6');
    expect(view.sentence).not.toContain('trên theme');
  });

  it('does not claim the latest version when the installed one is unreadable', () => {
    const view = snippetStatusView({
      installed: true,
      version: null,
      latestVersion: '6',
      themeName: 'Sartor',
    });
    expect(view.needsUpdate).toBe(false);
    expect(view.actionLabel).toBe('Cài lại');
    expect(view.sentence).toContain('chưa đọc được phiên bản');
  });

  it('stays secondary when the latest version is unknown', () => {
    const view = snippetStatusView({ installed: true, version: '6', latestVersion: null });
    expect(view.needsUpdate).toBe(false);
    expect(view.actionLabel).toBe('Cài lại');
    expect(view.sentence).toBe('Snippet v6 đã cài, đang là bản mới nhất.');
  });

  it('handles an empty status payload', () => {
    expect(snippetStatusView().actionLabel).toBe('Cài vào theme');
  });
});
