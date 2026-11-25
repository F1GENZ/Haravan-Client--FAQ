export const APP_ANTD_THEME = {
  token: {
    colorPrimary: "#1677ff",
    colorInfo: "#1677ff",
    // Link and preset-tag text sit on near-white surfaces, where antd's default
    // blue-6 / gold-7 / green-7 / orange-7 land between 2.2:1 and 4.1:1 — below
    // the 4.5:1 AA floor. Blue-7 and the 8/9 palette steps clear it.
    colorLink: "#0958d9",
    colorLinkHover: "#003eb3",
    colorLinkActive: "#002c8c",
    gold7: "#874d00",
    green7: "#237804",
    orange7: "#ad4e00",
    colorText: "#0f172a",
    colorTextSecondary: "#475569",
    colorTextTertiary: "#64748b",
    colorBorder: "#d9e1ec",
    colorBorderSecondary: "#e5eaf2",
    colorBgLayout: "#f5f7fb",
    colorBgContainer: "#ffffff",
    borderRadius: 8,
    controlHeight: 36,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    // White labels on the primary fill need blue-7 (5.9:1); blue-6 gives 4.1:1.
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      fontWeight: 600,
      colorPrimary: "#0958d9",
      colorPrimaryHover: "#003eb3",
      colorPrimaryActive: "#002c8c",
      primaryColor: "#ffffff",
    },
    Menu: {
      darkItemSelectedBg: "#0958d9",
    },
    Card: {
      borderRadiusLG: 10,
      paddingLG: 20,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Tabs: {
      titleFontSize: 14,
      horizontalMargin: "0 0 14px 0",
    },
  },
};
