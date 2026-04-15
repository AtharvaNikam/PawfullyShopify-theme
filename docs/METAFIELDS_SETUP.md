# Paws & Co. Product Metafields Setup

To make each product's PDP page show its own Ingredients, Feeding Guidelines, Reviews, etc., set up these metafield definitions in Shopify admin.

## Where to configure

Shopify admin → **Settings** → **Custom data** → **Products** → **Add definition**

## Required metafields (namespace: `custom`)

Create each of these:

| Name | Namespace | Key | Type | Description |
|------|-----------|-----|------|-------------|
| Ingredients | `custom` | `ingredients` | Rich text | Full ingredients list. Shows as first accordion row on PDP. |
| Feeding guidelines | `custom` | `feeding_guidelines` | Rich text | Feeding amounts by pet size. Shows as accordion row. |
| How to use | `custom` | `usage` | Rich text | Instructions / usage. Shows as accordion row. |
| Shipping info | `custom` | `shipping_info` | Rich text | Per-product shipping notes. Falls back to template default if blank. |
| FAQ | `custom` | `faq` | Rich text | Product-specific FAQs. Shows as final accordion row. |

## Optional: Reviews metafields (namespace: `reviews`)

If you're using a reviews app that writes to these metafields, or you want to manually enter review data:

| Name | Namespace | Key | Type |
|------|-----------|-----|------|
| Rating | `reviews` | `rating` | Decimal (e.g., 4.9) |
| Review count | `reviews` | `count` | Integer (e.g., 312) |
| Rating breakdown | `reviews` | `rating_breakdown` | JSON (e.g., `{"5_star": 86, "4_star": 10, "3_star": 3, "2_star": 1, "1_star": 0}`) |
| Review list | `reviews` | `list` | JSON (array of review objects) |

Example `list` JSON:
```json
[
  {
    "name": "Maya K.",
    "meta": "Verified buyer · 2 weeks ago",
    "stars": 5,
    "title": "Biscuit is OBSESSED",
    "body": "My beagle loses his mind the second he hears the bag crinkle.",
    "avatar": "https://i.pravatar.cc/100?img=32"
  }
]
```

## How to fill for each product

1. Open the product in Shopify admin
2. Scroll to **Metafields** section at the bottom
3. Fill in each field's value (Rich text fields give you a full editor)
4. Save

The PDP automatically pulls these values. **Empty fields are simply hidden** — so if a product doesn't have feeding guidelines (e.g., a collar), that accordion row won't render.

## Product tags that affect PDP display

Add these tags to products to auto-apply badges:
- `new` → shows "New" pill on gallery
- `bestseller` → shows "Bestseller" pill on gallery
- `vet-pick` → shows "Vet Pick" pill on gallery

If a product has a compare-at price > selling price, the discount % shows instead.
