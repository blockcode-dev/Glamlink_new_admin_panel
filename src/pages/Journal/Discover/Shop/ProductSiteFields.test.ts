import { describe, expect, it } from "vitest";
import { appendProductSiteFields } from "./ProductSiteFields";
import { appendTileFields } from "../../../JournalTopics/TopicTileFields";

const sent = (fill: (data: FormData) => void) => {
  const data = new FormData();
  fill(data);
  return Object.fromEntries(data.entries());
};

describe("A product's website fields", () => {
  it("sends the owner, brand, featuring and description", () => {
    expect(
      sent((d) =>
        appendProductSiteFields(d, {
          slug: " glow-serum ",
          description: "Two paragraphs.\n\nSecond.",
          owner_id: 12,
          brand_id: 40,
          is_featured: true,
          featured_order: 2,
        }),
      ),
    ).toEqual({
      slug: "glow-serum",
      description: "Two paragraphs.\n\nSecond.",
      owner_id: "12",
      brand_id: "40",
      is_featured: "true",
      featured_order: "2",
    });
  });

  it("clears the owner and brand with an empty value and leaves a blank slug out", () => {
    // A blank slug would change nothing on an edit; on a new product the API makes one from the title.
    expect(sent((d) => appendProductSiteFields(d, { slug: "", owner_id: null, brand_id: null }))).toEqual({
      description: "",
      owner_id: "",
      brand_id: "",
      is_featured: "false",
    });
  });
});

describe("A topic's home page tile fields", () => {
  it("sends the tile and its order", () => {
    expect(
      sent((d) => appendTileFields(d, { is_featured: true, featured_order: 3, tile_image: "https://api.test/images/t.jpg" })),
    ).toEqual({ is_featured: "true", featured_order: "3", tile_image: "https://api.test/images/t.jpg" });
  });

  it("removes the tile image with an empty value", () => {
    expect(sent((d) => appendTileFields(d, { is_featured: false, featured_order: null }))).toEqual({
      is_featured: "false",
      tile_image: "",
    });
  });
});
