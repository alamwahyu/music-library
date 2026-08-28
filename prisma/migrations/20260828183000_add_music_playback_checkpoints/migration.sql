ALTER TABLE "Music"
ADD COLUMN IF NOT EXISTS "playbackStart" INTEGER,
ADD COLUMN IF NOT EXISTS "playbackEnd" INTEGER;

CREATE TABLE IF NOT EXISTS "MusicCheckpoint" (
  "id" TEXT NOT NULL,
  "musicId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startSecond" INTEGER NOT NULL,
  "endSecond" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MusicCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MusicCheckpoint_musicId_idx" ON "MusicCheckpoint"("musicId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'MusicCheckpoint_musicId_fkey'
  ) THEN
    ALTER TABLE "MusicCheckpoint"
    ADD CONSTRAINT "MusicCheckpoint_musicId_fkey"
    FOREIGN KEY ("musicId") REFERENCES "Music"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
