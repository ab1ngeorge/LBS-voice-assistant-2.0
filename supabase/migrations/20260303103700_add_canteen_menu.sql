-- ============================================
-- Add College Canteen Menu to knowledge_base
-- ============================================

INSERT INTO knowledge_base (section_key, section_title, content, section_order) VALUES

('canteen_menu', '31. College Canteen Menu',
E'## 31. 🍽️ College Canteen Menu\n\n### 🍽️ Breakfast / Snacks\n| Item | Price |\n|------|-------|\n| Dosa | ₹8 |\n| Puttu | ₹8 |\n| Idli | ₹8 |\n| Poori | ₹8 |\n| Appam | ₹8 |\n| Porotta | ₹10 |\n| Chapathi | ₹8 |\n| Uzhunnu Vada | ₹15 |\n| Masala Dosa | ₹40 |\n| Kadalakari | ₹15 |\n| Green Peas Curry | ₹15 |\n| Bajji | ₹15 |\n| Mutta Curry | ₹20 |\n| Mutta Roast | ₹20 |\n| Oonu (Meals) | ₹30 |\n| Mutta Biriyani | ₹40 |\n| Biriyani Rice | ₹35 |\n| Chicken Biriyani | ₹70 |\n\n### ☕ Beverages & Light Items\n| Item | Price |\n|------|-------|\n| Chaya (Tea) | ₹8 |\n| Kappi (Coffee) | ₹8 |\n| Paal (Milk) | ₹15 |\n| Boost | ₹15 |\n| Horlicks | ₹15 |\n| Bru Coffee | ₹15 |\n| Parippu Vada | ₹8 |\n| Pazhampori | ₹8 |\n| Ullivada | ₹8 |\n| Ilayada | ₹10 |\n| Sukhiyan | ₹8 |\n| Masala Bonda | ₹8 |\n| Omelette | ₹15 / ₹25 |\n| Lime | ₹10 |\n| Lemon Juice | ₹8 |', 31)

ON CONFLICT (section_key) DO UPDATE
SET content = EXCLUDED.content,
    section_title = EXCLUDED.section_title,
    section_order = EXCLUDED.section_order;
