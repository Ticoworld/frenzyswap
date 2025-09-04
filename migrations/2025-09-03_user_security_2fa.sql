-- 2FA user security table
create table if not exists user_security (
  wallet_address text primary key,
  totp_secret text,
  totp_enabled boolean not null default false,
  recovery_codes text[] default '{}',
  updated_at timestamp with time zone default now()
);

alter table user_security enable row level security;

create policy "allow read own security" on user_security for select using (auth.uid() is not null);
create policy "allow update own security" on user_security for insert with check (true);
create policy "allow update own security patch" on user_security for update using (true);

create index if not exists idx_user_security_wallet on user_security(wallet_address);
