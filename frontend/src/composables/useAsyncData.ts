import { type Ref, ref, shallowRef } from 'vue';

/** Small helper for "load data, show loading/error" in views. */
export function useAsyncData<T>(loader: () => Promise<T>) {
  const data = shallowRef<T>() as Ref<T | undefined>;
  const loading = ref(false);
  const error = ref<string>();

  async function load(): Promise<void> {
    loading.value = true;
    error.value = undefined;
    try {
      data.value = await loader();
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, load };
}
