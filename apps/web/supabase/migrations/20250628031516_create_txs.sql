drop view if exists "public"."accounts_view";

create table "public"."txs" (
    "id" uuid not null default gen_random_uuid(),
    "createdAt" timestamp without time zone not null,
    "accountId" uuid,
    "spendAmount" text not null,
    "spendTo" text not null,
    "spendToken" text not null,
    "spendTxHash" text not null,
    "spendChainId" bigint not null,
    "spendAt" timestamp without time zone not null,
    "yieldDepositAmount" text,
    "yieldDepositToken" text,
    "yieldDepositTxHash" text,
    "yieldDepositAt" timestamp without time zone,
    "yieldDepositChainId" bigint,
    "spendFrom" text not null
);


alter table "public"."txs" enable row level security;

alter table "public"."accounts" add column "chainId" timestamp without time zone;

alter table "public"."accounts" alter column "roundUpToDollar" set default 1;

alter table "public"."accounts" alter column "roundUpToDollar" set data type integer using "roundUpToDollar"::integer;

CREATE UNIQUE INDEX txs_pkey ON public.txs USING btree (id);

CREATE UNIQUE INDEX "txs_spendTxHash_key" ON public.txs USING btree ("spendTxHash");

alter table "public"."txs" add constraint "txs_pkey" PRIMARY KEY using index "txs_pkey";

alter table "public"."txs" add constraint "txs_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES accounts(id) not valid;

alter table "public"."txs" validate constraint "txs_accountId_fkey";

alter table "public"."txs" add constraint "txs_spendTxHash_key" UNIQUE using index "txs_spendTxHash_key";

create or replace view "public"."accounts_view" as  SELECT "signerAddress",
    "createdAt",
    "triggerAddress"
   FROM accounts;


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


