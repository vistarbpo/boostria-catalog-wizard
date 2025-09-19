-- Fix security warnings by setting search_path on functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, plan, monthly_credits, renewal_date)
    VALUES (
        NEW.id,
        NEW.email,
        'member',
        'basic',
        500,
        CURRENT_DATE + INTERVAL '1 month'
    );
    
    INSERT INTO public.billing (user_id, plan, status)
    VALUES (NEW.id, 'basic', 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_action TEXT,
    p_credits INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_monthly_credits INTEGER;
    v_addon_credits INTEGER;
    v_total_available INTEGER;
BEGIN
    -- Get current credits
    SELECT monthly_credits, addon_credits 
    INTO v_monthly_credits, v_addon_credits
    FROM public.profiles 
    WHERE id = p_user_id;
    
    v_total_available := v_monthly_credits + v_addon_credits;
    
    -- Check if user has enough credits
    IF v_total_available < p_credits THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct from monthly credits first, then addon credits
    IF v_monthly_credits >= p_credits THEN
        UPDATE public.profiles 
        SET monthly_credits = monthly_credits - p_credits
        WHERE id = p_user_id;
    ELSE
        -- Use all monthly credits and remaining from addon
        UPDATE public.profiles 
        SET monthly_credits = 0,
            addon_credits = addon_credits - (p_credits - v_monthly_credits)
        WHERE id = p_user_id;
    END IF;
    
    -- Log the usage
    INSERT INTO public.credits_log (user_id, action, credits_used)
    VALUES (p_user_id, p_action, p_credits);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;