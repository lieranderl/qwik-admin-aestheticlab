import { component$, Slot } from '@builder.io/qwik';
import { RequestHandler, routeLoader$ } from '@builder.io/qwik-city';
import { fetchServices, fetchTechnicians } from '~/api/bookings/get';

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export const useTechnicians = routeLoader$(async () => {
  return fetchTechnicians();
});

export const useServices = routeLoader$(async () => {
  return fetchServices();
});


export default component$(() => {
  return (
    <>
      <Slot />
    </>
  );
});