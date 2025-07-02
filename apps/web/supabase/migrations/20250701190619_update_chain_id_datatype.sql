drop view if exists "public"."accounts_view";

alter table "public"."accounts" alter column "chainId" set data type text using "chainId"::text;

create or replace view "public"."accounts_view" as  SELECT "signerAddress",
    "createdAt",
    "triggerAddress",
    "tokenSourceAddress",
    "deploySalt"
   FROM accounts;



