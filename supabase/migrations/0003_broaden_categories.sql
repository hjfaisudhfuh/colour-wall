-- Broaden feeling_category from emotion-only to a generic "vibe / meaning" tag.
-- The Colour Wall is a creative canvas, not a feelings-only board, so users
-- making pixel art, tributes, or shout-outs need fits too. Existing values
-- remain valid — this only adds new allowed values.

alter table public.squares
  drop constraint if exists squares_feeling_category_check;

alter table public.squares
  add constraint squares_feeling_category_check
    check (
      feeling_category is null or feeling_category in (
        -- creative / casual
        'art','tribute','shoutout','memory','fun',
        -- emotional (kept for users who want them)
        'love','heartbreak','missing','hope','grateful',
        'lost','healing','nostalgic','happy',
        'other'
      )
    );
