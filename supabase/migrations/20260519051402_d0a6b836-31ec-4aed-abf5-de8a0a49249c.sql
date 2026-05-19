
-- Fix function search_path
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;

-- Revoke public execute on SECURITY DEFINER fns
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Tighten order insert: ensure user_id is null (guest) or matches auth.uid()
DROP POLICY "anyone create order" ON public.orders;
CREATE POLICY "create order self or guest" ON public.orders
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY "anyone create order items" ON public.order_items;
CREATE POLICY "create items for own order" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id IS NULL OR o.user_id = auth.uid()))
  );
