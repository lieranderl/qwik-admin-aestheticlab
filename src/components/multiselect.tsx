import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import { TechnicianResponse } from "~/types";


interface Props {
  technicians: TechnicianResponse[];
  selectedTechnicians: Signal<TechnicianResponse[]>;
}

export const TechMultiSelect = component$(({ technicians, selectedTechnicians }: Props) => {
  const search = useSignal('');
  const selectedIds = useSignal<string[]>([]);
  const dropdownOpen = useSignal(false);
  const filteredTechs = useSignal<TechnicianResponse[]>([]);

  useTask$(() => {
    selectedIds.value = technicians.map((tech) => tech.id);
  });

  useTask$(({ track }) => {
    track(() => search.value);
    filteredTechs.value = technicians.filter((tech) =>
      tech.name.toLowerCase().includes(search.value.toLowerCase())
    );
  });

  useTask$(({ track }) => {
    track(() => selectedIds.value);
    selectedTechnicians.value = technicians.filter((tech) =>
      selectedIds.value.includes(tech.id)
    );
  });

  const toggleSelect = $((id: string) => {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((x) => x !== id);
    } else {
      selectedIds.value = [...selectedIds.value, id];
    }
  });

  const removeSelected = $((id: string) => {
    selectedIds.value = selectedIds.value.filter((x) => x !== id);
  });

  return (
    <div class="w-full">
      <div class="form-control">
        <label class="label text-sm font-medium">Select Technicians</label>
        <input
          type="text"
          placeholder="Search technicians..."
          class="input input-bordered"
          bind:value={search}
          onFocus$={() => (dropdownOpen.value = true)}
          onBlur$={() => setTimeout(() => (dropdownOpen.value = false), 200)}
        />
      </div>

      {dropdownOpen.value && (
        <div class="mt-2 shadow-lg rounded-box border bg-base-100 max-h-52 overflow-auto z-50 absolute w-full">
          {filteredTechs.value.length === 0 ? (
            <div class="p-2 text-sm text-gray-500">No technicians found</div>
          ) : (
            filteredTechs.value.map((tech) => (
              <label
                key={tech.id}
                class="flex items-start gap-2 p-2 hover:bg-base-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm mt-1"
                  checked={selectedIds.value.includes(tech.id)}
                  onChange$={() => toggleSelect(tech.id)}
                />
                <div>
                  <div class="font-semibold">{tech.name}</div>
                  <div class="text-sm text-gray-500">{tech.email}</div>
                  <div class="text-xs text-gray-400">{tech.role}</div>
                </div>
              </label>
            ))
          )}
        </div>
      )}

      {selectedTechnicians.value.length > 0 && (
        <div class="mt-4">
          <div class="flex flex-wrap gap-2">
            {selectedTechnicians.value.map((tech) => (
              <div key={tech.id} class="badge badge-soft badge-primary gap-1">
                {tech.name}
                <button
                  type="button"
                  class="ml-1 text-error hover:text-red-700"
                  onClick$={() => removeSelected(tech.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
