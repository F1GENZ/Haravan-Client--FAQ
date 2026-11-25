export function themeDisplayName(...candidates) {
  for (const candidate of candidates) {
    const name = String(candidate ?? "").trim();
    if (name) return name;
  }
  return "";
}

const versionOf = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
};

/**
 * One decision for the snippet card: the CTA label/type plus the plain status sentence.
 * `latestVersion` is always present on a successful read; a missing one means the read
 * could not be compared, so the action stays a secondary reinstall.
 */
export function snippetStatusView({ installed, version, latestVersion, themeName } = {}) {
  const theme = themeDisplayName(themeName);
  const onTheme = theme ? ` trên theme ${theme}` : "";
  const current = versionOf(version);
  const latest = versionOf(latestVersion);

  if (!installed) {
    return {
      needsUpdate: false,
      actionLabel: "Cài vào theme",
      actionType: "primary",
      sentence: `Snippet chưa được cài${onTheme}.`,
    };
  }

  if (current === null) {
    return {
      needsUpdate: false,
      actionLabel: "Cài lại",
      actionType: "default",
      sentence: `Snippet đã cài${onTheme} nhưng chưa đọc được phiên bản.`,
    };
  }

  if (latest !== null && latest !== current) {
    return {
      needsUpdate: true,
      actionLabel: "Cập nhật",
      actionType: "primary",
      sentence: `Snippet v${current} đã cài${onTheme}, có bản mới v${latest}.`,
    };
  }

  return {
    needsUpdate: false,
    actionLabel: "Cài lại",
    actionType: "default",
    sentence: `Snippet v${current} đã cài, đang là bản mới nhất${onTheme}.`,
  };
}
