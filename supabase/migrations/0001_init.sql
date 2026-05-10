-- Dollar Grid initial schema.
-- A row in `squares` exists only when a cell is reserved (pending) or claimed.
-- Absence of a row = empty cell. Primary key (x,y) physically prevents duplicates.

create table if not exists public.squares (
  x                 smallint     not null check (x between 0 and 99),
  y                 smallint     not null check (y between 0 and 99),
  color             text         not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  name              text         check (name is null or char_length(name) <= 50),
  link              text         check (link is null or char_length(link) <= 200),
  status            text         not null check (status in ('pending', 'claimed')),
  stripe_session_id text         not null,
  price_cents       integer      not null check (price_cents > 0),
  pending_until     timestamptz,
  claimed_at        timestamptz,
  created_at        timestamptz  not null default now(),
  primary key (x, y)
);

create unique index if not exists squares_session_id_idx
  on public.squares(stripe_session_id);

create index if not exists squares_status_idx
  on public.squares(status);

create index if not exists squares_pending_until_idx
  on public.squares(pending_until)
  where status = 'pending';

-- Lock the table down. All writes happen via the service-role key on the
-- server. The anon role is not used by this app; even if it were, this
-- policy only exposes claimed cells (no pending rows, no Stripe ids).
alter table public.squares enable row level security;

drop policy if exists "claimed cells are publicly readable" on public.squares;
create policy "claimed cells are publicly readable"
  on public.squares
  for select
  using (status = 'claimed');

-- Atomic reservation. Returns the row on success, or no rows when the cell
-- is already claimed or held by a non-expired pending reservation.
create or replace function public.reserve_square(
  p_x           int,
  p_y           int,
  p_color       text,
  p_name        text,
  p_link        text,
  p_session_id  text,
  p_price_cents int,
  p_minutes     int
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
    (x, y, color, name, link, status, stripe_session_id, price_cents, pending_until)
  values
    (p_x, p_y, p_color, p_name, p_link, 'pending', p_session_id, p_price_cents,
     now() + make_interval(mins => p_minutes))
  on conflict (x, y) do update
    set color             = excluded.color,
        name              = excluded.name,
        link              = excluded.link,
        stripe_session_id = excluded.stripe_session_id,
        price_cents       = excluded.price_cents,
        pending_until     = excluded.pending_until,
        created_at        = now()
    where squares.status = 'pending'
      and squares.pending_until < now()
  returning * into result;

  return result; -- null if the conflict was blocked by an active row
end;
$$;

revoke all on function public.reserve_square(int,int,text,text,text,text,int,int) from public;
revoke all on function public.reserve_square(int,int,text,text,text,text,int,int) from anon, authenticated;
