-- Create database trigger to enforce email whitelist at database level
-- This prevents bypassing frontend validation

-- First, ensure the allowed_emails table exists
CREATE TABLE IF NOT EXISTS public.allowed_emails (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the allowed emails if they don't exist
INSERT INTO public.allowed_emails (email) 
VALUES 
    ('rentop.co.ae@gmail.com'),
    ('amine.ready@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS on allowed_emails table
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Only service role can manage allowed emails" ON public.allowed_emails;
DROP POLICY IF EXISTS "Only service role can access audit log" ON public.security_audit_log;

-- Create policy for allowed_emails (admin-only access)
CREATE POLICY "Service role manages allowed emails" 
ON public.allowed_emails 
FOR ALL 
USING (false);

-- Create the email validation function that will be called by trigger
CREATE OR REPLACE FUNCTION public.validate_user_email()
RETURNS TRIGGER AS $$
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_user_email_trigger ON auth.users;

-- Create trigger on auth.users to validate email before insertion
CREATE TRIGGER validate_user_email_trigger
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_user_email();

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log (service role only)
CREATE POLICY "Service role accesses audit log" 
ON public.security_audit_log 
FOR ALL 
USING (false);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_user_email TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (event_type, user_email, ip_address, user_agent, details)
    VALUES (p_event_type, p_user_email, p_ip_address, p_user_agent, p_details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;