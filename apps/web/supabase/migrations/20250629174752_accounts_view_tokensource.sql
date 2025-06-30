-- Drop the existing view
drop view if exists "public"."accounts_view";

-- Recreate the view with tokenSourceAddress and deploySalt included
create view "public"."accounts_view" as
select 
  "signerAddress",
  "createdAt", 
  "triggerAddress",
  "tokenSourceAddress",
  "deploySalt"
from "public"."accounts";

-- Grant permissions to access the view
grant select on "public"."accounts_view" to "anon";
grant select on "public"."accounts_view" to "authenticated";
grant select on "public"."accounts_view" to "service_role";

-- Add comment explaining the purpose
comment on view "public"."accounts_view" is 'Secure view of accounts table exposing only non-sensitive public fields including tokenSourceAddress and deploySalt';
