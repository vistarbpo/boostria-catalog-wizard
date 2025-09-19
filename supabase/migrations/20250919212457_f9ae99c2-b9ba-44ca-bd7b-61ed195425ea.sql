-- Fix search_path security warnings for functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.deduct_credits(UUID, TEXT, INTEGER) SET search_path = public;