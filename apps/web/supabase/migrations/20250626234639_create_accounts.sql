create table "public"."accounts" (
    "id" uuid not null default gen_random_uuid(),
    "createdAt" timestamp with time zone not null default now(),
    "signerAddress" text not null,
    "tokenSourceAddress" text not null,
    "triggerAddress" text not null,
    "roundUpToDollar" smallint not null default '1'::smallint,
    "roundUpMode" text not null default 'card-only'::text,
    "delegation" jsonb not null,
    "savingsAddress" text,
    "deploySalt" text not null
);


alter table "public"."accounts" enable row level security;

CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);

CREATE UNIQUE INDEX "accounts_signerAddress_deploySalt_key" ON public.accounts USING btree ("signerAddress", "deploySalt");

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."accounts" add constraint "accounts_signerAddress_deploySalt_key" UNIQUE using index "accounts_signerAddress_deploySalt_key";

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


