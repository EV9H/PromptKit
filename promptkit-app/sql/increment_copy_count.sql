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