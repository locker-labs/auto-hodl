alter table if exists "public"."accounts" add column if not exists "chainMode" text not null default 'single-chain'::text;


