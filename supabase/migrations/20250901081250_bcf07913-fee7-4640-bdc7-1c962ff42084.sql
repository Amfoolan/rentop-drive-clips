-- Fix security warnings: Set search_path for all functions to prevent injection
-- This addresses the "Function Search Path Mutable" warnings

-- Update existing functions to have secure search_path
ALTER FUNCTION public.validate_user_email() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_security_event(TEXT, TEXT, TEXT, TEXT, JSONB) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- Recreate the functions with proper search_path (more explicit approach)
CREATE OR REPLACE FUNCTION public.validate_user_email()
RETURNS TRIGGER 
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Check if the email is in the allowed_emails table
    IF NOT EXISTS (
        SELECT 1 FROM public.allowed_emails 
        WHERE email = NEW.email
    ) THEN
        RAISE EXCEPTION 'Access denied. Email "%" is not authorized for this application.', NEW.email
            USING ERRCODE = 'check_violation',
                  HINT = 'Contact administrator for access.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_user_email TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID 
SET search_path = public, pg_temp
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (event_type, user_email, ip_address, user_agent, details)
    VALUES (p_event_type, p_user_email, p_ip_address, p_user_agent, p_details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;