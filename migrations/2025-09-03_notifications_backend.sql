-- Notifications backend: subscriptions and delivery logs

create table if not exists notification_subscriptions (
  endpoint text primary key,
  wallet_address text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

create table if not exists notification_deliveries (
  id uuid default gen_random_uuid() primary key,
  wallet_address text,
  channel text not null, -- 'web-push' | 'email' | 'in-app'
  status text not null,  -- 'queued' | 'sent' | 'failed'
  title text,
  body text,
  payload jsonb,
  error text,
  created_at timestamptz default now()
);

alter table if exists notification_subscriptions enable row level security;
alter table if exists notification_deliveries enable row level security;

do $$ begin
  if not exists (select 1 from pg_policy p join pg_class c on p.polrelid=c.oid where p.polname='public_select_notification_subs' and c.relname='notification_subscriptions') then
    create policy "public_select_notification_subs" on notification_subscriptions for select using (true);
  end if;
  if not exists (select 1 from pg_policy p join pg_class c on p.polrelid=c.oid where p.polname='public_select_notification_deliveries' and c.relname='notification_deliveries') then
    create policy "public_select_notification_deliveries" on notification_deliveries for select using (true);
  end if;
end $$;

revoke insert, update, delete on notification_subscriptions from anon, authenticated;
revoke insert, update, delete on notification_deliveries from anon, authenticated;

create index if not exists idx_notification_subs_wallet on notification_subscriptions(wallet_address);
create index if not exists idx_notification_deliveries_wallet on notification_deliveries(wallet_address);
