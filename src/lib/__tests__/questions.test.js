import { describe, expect, it } from "vitest";
import {
  hasAnswerText,
  ownerFaqPath,
  ownerLabel,
  timeAgo,
} from "../questions.js";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("ownerLabel", () => {
  it("names the owner type and title", () => {
    expect(
      ownerLabel({ owner_type: "products", owner_title: "Tai nghe Razer" })
    ).toBe("Sản phẩm: Tai nghe Razer");
    expect(ownerLabel({ owner_type: "shop", owner_title: "Bất kỳ" })).toBe("Shop");
  });

  it("falls back to the type when the title is missing", () => {
    expect(ownerLabel({ owner_type: "pages", owner_title: "  " })).toBe("Trang");
    expect(ownerLabel({ owner_type: "weird", owner_title: "x" })).toBe("Shop");
  });
});

describe("timeAgo", () => {
  const now = Date.UTC(2026, 10, 27, 12);

  it("formats recent timestamps in Vietnamese", () => {
    expect(timeAgo(now - 30_000, now)).toBe("vừa xong");
    expect(timeAgo(now - 5 * MINUTE, now)).toBe("5 phút trước");
    expect(timeAgo(now - 3 * HOUR, now)).toBe("3 giờ trước");
    expect(timeAgo(now - 2 * DAY, now)).toBe("2 ngày trước");
  });

  it("switches to a date after a week and ignores bad input", () => {
    expect(timeAgo(now - 10 * DAY, now)).toBe(
      new Date(now - 10 * DAY).toLocaleDateString("vi-VN")
    );
    expect(timeAgo(undefined, now)).toBe("");
  });
});

describe("hasAnswerText", () => {
  it("rejects empty editor output", () => {
    expect(hasAnswerText("")).toBe(false);
    expect(hasAnswerText("<p><br></p>")).toBe(false);
    expect(hasAnswerText("<p>&nbsp;</p>")).toBe(false);
  });

  it("accepts real text including entities-only markup", () => {
    expect(hasAnswerText("<p>Có, bảo hành 12 tháng.</p>")).toBe(true);
    expect(hasAnswerText("<ul><li>a</li></ul>")).toBe(true);
  });
});

describe("ownerFaqPath", () => {
  it("links resource-owned questions to their FAQ list", () => {
    expect(ownerFaqPath({ owner_type: "products", owner_id: "1078275055" })).toBe(
      "/products?id=1078275055"
    );
  });

  it("returns null for shop-owned or incomplete questions", () => {
    expect(ownerFaqPath({ owner_type: "shop", owner_id: "0" })).toBeNull();
    expect(ownerFaqPath({ owner_type: "products", owner_id: "" })).toBeNull();
    expect(ownerFaqPath({ owner_type: "products", owner_id: "0" })).toBeNull();
  });
});
