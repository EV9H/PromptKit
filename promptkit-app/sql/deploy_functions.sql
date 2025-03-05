-- Add view_count column to prompts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'prompts' 
        AND column_name = 'view_count'
    ) THEN
        ALTER TABLE public.prompts ADD COLUMN view_count integer NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Create or replace the function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.prompts
  SET view_count = view_count + 1
  WHERE id = row_id
  RETURNING view_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the function to increment copy count
CREATE OR REPLACE FUNCTION public.increment_copy_count(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.prompts
  SET copy_count = copy_count + 1
  WHERE id = row_id
  RETURNING copy_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_copy_count(UUID) TO authenticated, anon; 