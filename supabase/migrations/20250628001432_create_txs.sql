create table "public"."accounts" (
    "id" uuid not null default gen_random_uuid(),
    "createdAt" timestamp with time zone not null default now(),
    "signerAddress" text not null,
    "tokenSourceAddress" text not null,
    "triggerAddress" text not null,
    "roundUpToDollar" integer not null,
    "roundUpMode" text not null default 'card-only'::text,
    "delegation" jsonb not null,
    "savingsAddress" text,
    "deploySalt" text not null,
    "chainId" timestamp without time zone
);


alter table "public"."accounts" enable row level security;

create table "public"."txs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp without time zone not null,
    "accountId" uuid not null,
    "spendAmount" text not null,
    "spendRecipient" text not null,
    "spendToken" text not null,
    "spendTxHash" text not null,
    "spendChainId" bigint not null,
    "spendAt" timestamp without time zone not null,
    "yieldDepositAmount" text,
    "yieldDepositToken" text,
    "yieldDepositTxHash" text,
    "yieldDepositAt" timestamp without time zone,
    "yieldDepositChainId" bigint
);


alter table "public"."txs" enable row level security;

CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);

CREATE UNIQUE INDEX "accounts_signerAddress_deploySalt_key" ON public.accounts USING btree ("signerAddress", "deploySalt");

CREATE UNIQUE INDEX txs_pkey ON public.txs USING btree (id);

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."txs" add constraint "txs_pkey" PRIMARY KEY using index "txs_pkey";

alter table "public"."accounts" add constraint "accounts_signerAddress_deploySalt_key" UNIQUE using index "accounts_signerAddress_deploySalt_key";

alter table "public"."txs" add constraint "txs_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES accounts(id) not valid;

alter table "public"."txs" validate constraint "txs_accountId_fkey";

create or replace view "public"."accounts_view" as  SELECT "signerAddress",
    "createdAt",
    "triggerAddress"
   FROM accounts;


grant delete on table "public"."accounts" to "anon";

grant insert on table "public"."accounts" to "anon";

grant references on table "public"."accounts" to "anon";

grant select on table "public"."accounts" to "anon";

grant trigger on table "public"."accounts" to "anon";

grant truncate on table "public"."accounts" to "anon";

grant update on table "public"."accounts" to "anon";

grant delete on table "public"."accounts" to "authenticated";

grant insert on table "public"."accounts" to "authenticated";

grant references on table "public"."accounts" to "authenticated";

grant select on table "public"."accounts" to "authenticated";

grant trigger on table "public"."accounts" to "authenticated";

grant truncate on table "public"."accounts" to "authenticated";

grant update on table "public"."accounts" to "authenticated";

grant delete on table "public"."accounts" to "service_role";

grant insert on table "public"."accounts" to "service_role";

grant references on table "public"."accounts" to "service_role";

grant select on table "public"."accounts" to "service_role";

grant trigger on table "public"."accounts" to "service_role";

grant truncate on table "public"."accounts" to "service_role";

grant update on table "public"."accounts" to "service_role";

grant delete on table "public"."txs" to "anon";

grant insert on table "public"."txs" to "anon";

grant references on table "public"."txs" to "anon";

grant select on table "public"."txs" to "anon";

grant trigger on table "public"."txs" to "anon";

grant truncate on table "public"."txs" to "anon";

grant update on table "public"."txs" to "anon";

grant delete on table "public"."txs" to "authenticated";

grant insert on table "public"."txs" to "authenticated";

grant references on table "public"."txs" to "authenticated";

grant select on table "public"."txs" to "authenticated";

grant trigger on table "public"."txs" to "authenticated";

grant truncate on table "public"."txs" to "authenticated";

grant update on table "public"."txs" to "authenticated";

grant delete on table "public"."txs" to "service_role";

grant insert on table "public"."txs" to "service_role";

grant references on table "public"."txs" to "service_role";

grant select on table "public"."txs" to "service_role";

grant trigger on table "public"."txs" to "service_role";

grant truncate on table "public"."txs" to "service_role";

grant update on table "public"."txs" to "service_role";


