-- Add emotional fields to squares: a feeling category and a short public message.
-- Both nullable so existing claimed rows remain valid (no data destruction).

alter table public.squares
  add column if not exists feeling_category text
    check (
      feeling_category is null or feeling_category in (
        'love','heartbreak','missing','hope','grateful',
        'lost','healing','nostalgic','happy','other'
      )
    );

alter table public.squares
  add column if not exists message text
    check (message is null or char_length(message) <= 100);

-- Replace reserve_square with a version that persists feeling + message.
-- Single caller (/api/checkout); safe to change signature.
drop function if exists public.reserve_square(int,int,text,text,text,text,int,int);

create or replace function public.reserve_square(
  p_x                int,
  p_y                int,
  p_color            text,
  p_name             text,
  p_link             text,
  p_feeling_category text,
  p_message          text,
  p_session_id       text,
  p_price_cents      int,
  p_minutes          int
)
returns public.squares
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.squares;
begin
  insert into public.squares
    (x, y, color, name, link, feeling_category, message,
     status, stripe_session_id, price_cents, pending_until)
  values
    (p_x, p_y, p_color, p_name, p_link, p_feeling_category, p_message,
     'pending', p_session_id, p_price_cents,
     now() + make_interval(mins => p_minutes))
  on conflict (x, y) do update
    set color             = excluded.color,
        name              = excluded.name,
        link              = excluded.link,
        feeling_category  = excluded.feeling_category,
        message           = excluded.message,
        stripe_session_id = excluded.stripe_session_id,
        price_cents       = excluded.price_cents,
        pending_until     = excluded.pending_until,
        created_at        = now()
    where squares.status = 'pending'
      and squares.pending_until < now()
  returning * into result;

  return result;
end;
$$;

revoke all on function public.reserve_square(int,int,text,text,text,text,text,text,int,int) from public;
revoke all on function public.reserve_square(int,int,text,text,text,text,text,text,int,int) from anon, authenticated;

-- The existing RLS policy "claimed cells are publicly readable" already covers
-- the new columns (column-level grants apply automatically); selecting them
-- from anon will return values only for claimed rows.
