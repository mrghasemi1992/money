-- One free-text field (#133): each note moves to the end of its description, and the note is
-- cleared. Text already in the other field isn't repeated (the same rule as `withNote`).
-- The column stays for the previous version; a later release drops it.
UPDATE "transactions"
SET
  "description" = CASE
    WHEN strpos(btrim("description"), btrim("note")) > 0 THEN btrim("description")
    WHEN btrim("description") = '' OR strpos(btrim("note"), btrim("description")) > 0 THEN btrim("note")
    ELSE btrim("description") || ' — ' || btrim("note")
  END,
  "note" = ''
WHERE "note" <> '';
