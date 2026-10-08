-- «؟» no longer marks an unknown transaction (a missing category does): an empty description stays empty.
UPDATE "transactions" SET "description" = '' WHERE btrim("description") IN ('؟', '?');
