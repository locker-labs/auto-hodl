-- Create a secure view of accounts table with only public fields
create view "public"."accounts_view" as
select 
  "signerAddress",
  "createdAt", 
  "triggerAddress"
from "public"."accounts";

-- Grant permissions to access the view
grant select on "public"."accounts_view" to "anon";
grant select on "public"."accounts_view" to "authenticated";
grant select on "public"."accounts_view" to "service_role";

-- Add comment explaining the purpose
comment on view "public"."accounts_view" is 'Secure view of accounts table exposing only non-sensitive public fields';
