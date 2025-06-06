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

  // Filter technicians by search term
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

  // Sync selected IDs to selectedTechnicians signal (parent)
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
    <div class="relative w-80">
      {/* Selected badges */}
      <div class="flex flex-wrap gap-1 mb-1">
        {selectedTechnicians.value.map((tech) => (
          <span
            key={tech.id}
            class="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1"
          >
            <span>{tech.name}</span>
            <button
              onClick$={() => removeSelected(tech.id)}
              class="font-bold hover:text-gray-200"
              aria-label={`Remove ${tech.name}`}
              type="button"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {/* Dropdown input */}
      <input
        type="text"
        class="input input-bordered w-full"
        placeholder="Search and select technicians..."
        bind:value={search}
        onFocus$={() => (dropdownOpen.value = true)}
        onBlur$={() => setTimeout(() => (dropdownOpen.value = false), 150)}
      />

      {/* Dropdown options */}
      {dropdownOpen.value && (
        <div class="absolute z-10 w-full max-h-48 overflow-auto border rounded bg-white mt-1 shadow-lg">
          {filteredTechs.value.length === 0 ? (
            <div class="p-2 text-gray-500">No technicians found</div>
          ) : (
            filteredTechs.value.map((tech) => (
              <label
                key={tech.id}
                class="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.value.includes(tech.id)}
                  onChange$={() => toggleSelect(tech.id)}
                  class="checkbox"
                />
                <div>
                  <div class="font-bold">{tech.name}</div>
                  <div class="text-sm text-gray-600">{tech.email}</div>
                  <div class="text-xs text-gray-400">{tech.role}</div>
                </div>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
});
